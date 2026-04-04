const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const todosCol = db.collection('todos')

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  switch (action) {
    case 'list':
      return await listTodos(OPENID, event.filters || {})
    case 'get':
      return await getTodo(OPENID, event.todoId)
    case 'create':
      return await createTodo(OPENID, event.todo)
    case 'update':
      return await updateTodo(OPENID, event.todoId, event.todo)
    case 'delete':
      return await deleteTodo(OPENID, event.todoId)
    case 'toggleComplete':
      return await toggleComplete(OPENID, event.todoId)
    case 'batchUpdateOrder':
      return await batchUpdateOrder(OPENID, event.items)
    case 'clearAll':
      return await clearAll(OPENID)
    default:
      return { error: 'Unknown action' }
  }
}

async function listTodos(openid, filters) {
  let query = todosCol.where({ _openid: openid })

  if (filters.completed === true) {
    query = todosCol.where({ _openid: openid, completed: true })
  } else if (filters.completed === false) {
    query = todosCol.where({ _openid: openid, completed: false })
  }

  if (filters.categoryId) {
    query = query.where({ categoryId: filters.categoryId })
  }

  if (filters.priority) {
    query = query.where({ priority: filters.priority })
  }

  // 获取所有记录（分批获取，每次最多1000条）
  const countResult = await todosCol.where({ _openid: openid }).count()
  const total = countResult.total
  const batchSize = 1000
  let todos = []

  for (let i = 0; i < total; i += batchSize) {
    const batch = await query.orderBy('sortOrder', 'asc').skip(i).limit(batchSize).get()
    todos = todos.concat(batch.data)
  }

  // 关键词搜索在服务端过滤
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    todos = todos.filter(t =>
      t.title.toLowerCase().includes(kw) ||
      (t.description && t.description.toLowerCase().includes(kw))
    )
  }

  // 统一 id 字段
  todos.forEach(t => { t.id = t._id })

  return { data: todos }
}

async function getTodo(openid, todoId) {
  try {
    const res = await todosCol.doc(todoId).get()
    if (res.data._openid !== openid) return { data: null }
    res.data.id = res.data._id
    return { data: res.data }
  } catch (e) {
    return { data: null }
  }
}

async function createTodo(openid, todoData) {
  // 获取最大 sortOrder
  const latest = await todosCol.where({ _openid: openid })
    .orderBy('sortOrder', 'desc').limit(1).get()
  const maxOrder = latest.data.length > 0 ? (latest.data[0].sortOrder || 0) : 0

  const now = Date.now()
  const doc = {
    title: todoData.title,
    description: todoData.description || '',
    completed: false,
    priority: todoData.priority || 'medium',
    dueDate: todoData.dueDate || null,
    categoryId: todoData.categoryId || null,
    sortOrder: maxOrder + 1,
    createdAt: now,
    updatedAt: now
  }

  const res = await todosCol.add({ data: doc })
  doc._id = res._id
  doc.id = res._id
  return { data: doc }
}

async function updateTodo(openid, todoId, todoData) {
  const updateData = { ...todoData, updatedAt: Date.now() }
  delete updateData._id
  delete updateData._openid
  delete updateData.id

  await todosCol.doc(todoId).update({ data: updateData })

  const res = await todosCol.doc(todoId).get()
  res.data.id = res.data._id
  return { data: res.data }
}

async function deleteTodo(openid, todoId) {
  await todosCol.doc(todoId).remove()
  return { success: true }
}

async function toggleComplete(openid, todoId) {
  const res = await todosCol.doc(todoId).get()
  if (res.data._openid !== openid) return { error: 'Unauthorized' }

  const newVal = !res.data.completed
  await todosCol.doc(todoId).update({
    data: { completed: newVal, updatedAt: Date.now() }
  })

  res.data.completed = newVal
  res.data.id = res.data._id
  return { data: res.data }
}

async function batchUpdateOrder(openid, items) {
  const tasks = items.map(({ id, sortOrder }) =>
    todosCol.doc(id).update({
      data: { sortOrder, updatedAt: Date.now() }
    })
  )
  await Promise.all(tasks)
  return { success: true }
}

async function clearAll(openid) {
  // 分批删除
  const countResult = await todosCol.where({ _openid: openid }).count()
  const total = countResult.total

  for (let i = 0; i < total; i += 100) {
    const batch = await todosCol.where({ _openid: openid }).limit(100).get()
    const delTasks = batch.data.map(d => todosCol.doc(d._id).remove())
    await Promise.all(delTasks)
  }

  return { success: true }
}
