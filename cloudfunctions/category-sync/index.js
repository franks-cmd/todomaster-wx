const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const categoriesCol = db.collection('categories')
const todosCol = db.collection('todos')

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  switch (action) {
    case 'list':
      return await listCategories(OPENID)
    case 'create':
      return await createCategory(OPENID, event.category)
    case 'update':
      return await updateCategory(OPENID, event.categoryId, event.category)
    case 'delete':
      return await deleteCategory(OPENID, event.categoryId)
    default:
      return { error: 'Unknown action' }
  }
}

async function listCategories(openid) {
  const res = await categoriesCol.where({ _openid: openid })
    .orderBy('createdAt', 'asc')
    .limit(1000)
    .get()

  res.data.forEach(c => { c.id = c._id })
  return { data: res.data }
}

async function createCategory(openid, catData) {
  const now = Date.now()
  const doc = {
    name: catData.name,
    color: catData.color,
    createdAt: now
  }

  const res = await categoriesCol.add({ data: doc })
  doc._id = res._id
  doc.id = res._id
  return { data: doc }
}

async function updateCategory(openid, categoryId, catData) {
  const updateData = {}
  if (catData.name !== undefined) updateData.name = catData.name
  if (catData.color !== undefined) updateData.color = catData.color

  await categoriesCol.doc(categoryId).update({ data: updateData })

  const res = await categoriesCol.doc(categoryId).get()
  res.data.id = res.data._id
  return { data: res.data }
}

async function deleteCategory(openid, categoryId) {
  // 删除分类
  await categoriesCol.doc(categoryId).remove()

  // 将关联的待办的 categoryId 置空
  // 云数据库不支持按 _openid + categoryId 批量更新，需分批处理
  const batch = await todosCol.where({
    _openid: openid,
    categoryId: categoryId
  }).limit(1000).get()

  const tasks = batch.data.map(t =>
    todosCol.doc(t._id).update({ data: { categoryId: null } })
  )
  await Promise.all(tasks)

  return { success: true }
}
