# TodoMaster 微信小程序版

基于 [TodoMaster](https://github.com/franks-cmd/todomaster) 的微信小程序版本，全功能任务管理应用。

## 功能特性

- **待办管理**：创建、编辑、删除、完成待办事项
- **优先级**：高/中/低三级优先级，颜色区分
- **自定义分类**：支持颜色标识的自定义分类
- **搜索筛选**：关键词搜索 + 分类/优先级/状态多维度筛选
- **拖拽排序**：自定义待办排列顺序
- **双存储模式**：
  - 🔒 **本地存储**：数据仅存设备端，绝对隐私
  - ☁️ **云端存储**：微信云开发，多设备同步
- **到期提醒**：
  - 微信订阅消息推送（长期订阅）
  - 应用内弹窗提醒
- **数据迁移**：本地 ↔ 云端一键迁移

## 技术栈

- 微信小程序原生框架（WXML / WXSS / JS）
- 微信云开发（云数据库 + 云函数 + 定时触发器）

## 项目结构

```
todomaster-wx/
├── miniprogram/           # 小程序前端
│   ├── pages/             # 页面（6个）
│   ├── components/        # 组件（8个）
│   ├── utils/             # 工具模块
│   └── images/            # 静态资源
├── cloudfunctions/        # 云函数（5个）
│   ├── login/             # 获取 openid
│   ├── todo-sync/         # 待办 CRUD
│   ├── category-sync/     # 分类 CRUD
│   ├── migrate-to-cloud/  # 数据迁移
│   └── check-reminders/   # 定时提醒
└── project.config.json    # 项目配置
```

## 快速开始

### 前置要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 微信小程序 AppID

### 配置步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/YOUR_USERNAME/todomaster-wx.git
   ```

2. **导入项目**
   - 打开微信开发者工具
   - 选择「导入项目」，选择 `todomaster-wx` 目录
   - 填入你的 AppID

3. **配置云开发环境**
   - 在开发者工具中开通云开发
   - 创建云开发环境，记录环境 ID
   - 修改 `miniprogram/app.js` 中的 `cloudEnv` 为你的环境 ID

4. **创建云数据库集合**
   - `todos`
   - `categories`
   - `reminder_logs`
   - 所有集合权限设为「仅创建者可读写」

5. **部署云函数**
   - 右键每个云函数目录 → 「上传并部署：云端安装依赖」
   - `check-reminders` 部署后需上传触发器

6. **配置订阅消息**（可选）
   - 在微信公众平台申请订阅消息模板
   - 将模板 ID 替换到：
     - `miniprogram/utils/constants.js` 的 `SUBSCRIBE_TEMPLATE_ID`
     - `cloudfunctions/check-reminders/index.js` 的 `TEMPLATE_ID`

7. **替换 TabBar 图标**
   - 将 `miniprogram/images/` 下的占位图标替换为正式图标（81×81px PNG）

## 云数据库集合结构

### todos
| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 待办标题 |
| description | string | 详细描述 |
| completed | boolean | 是否完成 |
| priority | string | high/medium/low |
| dueDate | number | 截止时间戳 |
| categoryId | string | 分类ID |
| sortOrder | number | 排序序号 |

### categories
| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 分类名称 |
| color | string | 颜色（十六进制） |

## License

MIT
