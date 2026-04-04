const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { todos = [], categories = [] } = event

  const result = {
    categoriesImported: 0,
    todosImported: 0,
    errors: []
  }

  // 1. 导入分类，记录旧ID到新ID的映射
  const categoryIdMap = {}

  for (const cat of categories) {
    try {
      const oldId = cat.id || cat._id
      const res = await db.collection('categories').add({
        data: {
          name: cat.name,
          color: cat.color,
          createdAt: cat.createdAt || Date.now()
        }
      })
      categoryIdMap[oldId] = res._id
      result.categoriesImported++
    } catch (err) {
      result.errors.push(`分类 "${cat.name}" 导入失败: ${err.message}`)
    }
  }

  // 2. 导入待办，重映射 categoryId
  for (const todo of todos) {
    try {
      const newCatId = todo.categoryId ? (categoryIdMap[todo.categoryId] || null) : null

      await db.collection('todos').add({
        data: {
          title: todo.title,
          description: todo.description || '',
          completed: todo.completed || false,
          priority: todo.priority || 'medium',
          dueDate: todo.dueDate || null,
          categoryId: newCatId,
          sortOrder: todo.sortOrder || 0,
          createdAt: todo.createdAt || Date.now(),
          updatedAt: todo.updatedAt || Date.now()
        }
      })
      result.todosImported++
    } catch (err) {
      result.errors.push(`待办 "${todo.title}" 导入失败: ${err.message}`)
    }
  }

  return result
}
