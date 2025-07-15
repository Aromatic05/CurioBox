# **API 文档**

本文档详细说明了 CurioBox 盲盒系统的所有 API，包括认证、社区、盲盒、物品、订单、个人仓库等。


## 用户状态管理相关接口（软删除/封禁/解封）

### 删除用户（软删除）

- **Endpoint:** `POST /auth/delete-user`
- **描述:** 删除当前登录用户（或管理员删除任意用户，实际为软删除，status 设为 deleted）。
- **认证:** 需要 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "userId": 123 // 管理员删除时传递
    }
    ```
- **成功响应 (200 OK):**
    ```json
    {
        "message": "User deleted successfully"
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未登录或无权限。
    - `404 Not Found`: 用户不存在。

### 封禁用户

- **Endpoint:** `POST /auth/ban-user`
- **描述:** 管理员封禁指定用户（将 status 设为 banned）。
- **认证:** 需要管理员 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "userId": 123
    }
    ```
- **成功响应 (200 OK):**
    ```json
    {
        "message": "User banned successfully"
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未登录或无权限。
    - `404 Not Found`: 用户不存在。

### 解封用户

- **Endpoint:** `POST /auth/unban-user`
- **描述:** 管理员解封指定用户（将 status 设为 active）。
- **认证:** 需要管理员 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "userId": 123
    }
    ```
- **成功响应 (200 OK):**
    ```json
    {
        "message": "User unbanned successfully"
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未登录或无权限。
    - `404 Not Found`: 用户不存在。

> 说明：所有用户相关查询、登录等接口需自动过滤 status 为 deleted 或 banned 的用户。
### **3.x. 获取某个盲盒下的所有帖子**

- **Endpoint:** `GET /curio-boxes/:id/posts`
- **描述:** 获取指定盲盒下的所有帖子，支持分页、排序等参数。
- **查询参数 (Query Parameters):**
    - `sortBy` (可选): 排序方式（如 'latest', 'hot', 'comprehensive'）。
    - `order` (可选): 排序顺序（'ASC' 或 'DESC'）。
    - `page` (可选): 页码，默认 1。
    - `pageSize` (可选): 每页数量，默认 20。
    - 其它帖子查询参数同 `/showcase/posts`。
- **成功响应 (200 OK):**
    ```json
    {
        "items": [
            {
                "id": 1,
                "title": "帖子标题",
                "content": "帖子内容",
                "images": ["image1.jpg"],
                "userId": 2,
                "curioBoxId": 1,
                "tags": [],
                "createdAt": "2025-07-15T12:00:00Z"
            }
        ],
        "meta": {
            "page": 1,
            "pageSize": 20,
            "total": 1,
            "totalPages": 1
        }
    }
    ```
- **错误响应:**
    - `404 Not Found`: 盲盒不存在。

> 说明：本系统所有用户相关接口均以 JWT 的 `sub` 字段作为唯一用户ID标识，响应体中的 `id` 或 `userId` 均为此 ID。

---

## **1. 认证模块 (Auth)**

此模块处理所有与用户账户相关的操作，如注册、登录、密码修改等。

> 说明：本系统用户ID采用 JWT 的 `sub` 字段作为唯一标识，所有认证相关接口响应体中的 `sub` 即为用户ID。

### **1.1. 用户注册**

- **Endpoint:** `POST /auth/register`
- **描述:** 创建一个新用户账户。
- **请求体 (Body):**
    ```json
    {
        "username": "your_username",
        "password": "your_password",
        "role": "user"
    }
    ```

    - `role` 是可选字段, 默认为 'user'。
- **成功响应 (201 Created):**
    ```json
    {
        "id": 1,
        "username": "your_username",
        "role": "user"
    }
    ```
- **错误响应:**
    - `409 Conflict`: 用户名已存在。
    - `400 Bad Request`: 请求数据不合法（例如，缺少 `password` 字段）。

### **1.2. 用户登录**

- **Endpoint:** `POST /auth/login`
- **描述:** 用户登录并获取用于后续请求的 `accessToken`。
- **请求体 (Body):**
    ```json
    {
        "username": "your_username",
        "password": "your_password"
    }
    ```
- **成功响应 (200 OK):**
    ```json
    {
        "accessToken": "your_jwt_token"
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 用户名或密码错误。

### **1.3. 修改密码**

- **Endpoint:** `POST /auth/change-password`
- **描述:** 修改当前已登录用户的密码。
- **认证:** 需要 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "oldPassword": "current_password",
        "newPassword": "new_password"
    }
    ```
- **成功响应 (200 OK):**
    ```json
    {
        "message": "Password changed successfully"
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未提供Token、Token无效或旧密码错误。

### **1.4. 设置昵称**

- **Endpoint:** `POST /auth/set-nickname`
- **描述:** 为当前登录用户设置或更新昵称。
- **认证:** 需要 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "nickname": "新的昵称"
    }
    ```
- **成功响应 (200 OK):**
    ```json
    {
        "message": "Nickname updated successfully"
    }
    ```
- **注意:** 此接口无法用于修改用户角色(`role`)等其他受保护字段。
- **错误响应:**
    - `401 Unauthorized`: 未提供Token或Token无效。

### **1.5. 退出登录**

- **Endpoint:** `GET /auth/logout`
- **描述:** 使当前用户的 `accessToken` 失效。
- **认证:** 需要 Bearer Token。
- **成功响应 (200 OK):**
    ```json
    {
        "message": "Logged out successfully"
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未提供Token或Token无效。

### **1.6. 设置头像**

- **Endpoint:** `POST /auth/set-avatar`
- **描述:** 设置当前登录用户的头像。
- **认证:** 需要 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "avatar": "/static/xxxx.jpg"
    }
    ```
- **成功响应 (200 OK):**
    ```json
    {
        "message": "Avatar updated successfully"
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未提供Token或Token无效。

### **1.7. 上传头像图片**

- **Endpoint:** `POST /auth/upload-avatar`
- **描述:** 上传头像图片，返回图片URL。
- **认证:** 需要 Bearer Token。
- **请求体 (form-data):**
    - `file`: 图片文件（最大5MB）
- **成功响应 (200 OK):**
    ```json
    {
        "url": "/static/xxxx.jpg"
    }
    ```
- **错误响应:**
    - `400 Bad Request`: 图片类型/大小不符合要求。
    - `401 Unauthorized`: 未登录。

### **1.8. 删除用户**

- **Endpoint:** `POST /auth/delete-user`
- **描述:** 删除当前登录用户（或管理员删除任意用户）。
- **认证:** 需要 Bearer Token。
- **成功响应 (200 OK):**
    ```json
    {
        "message": "User deleted successfully"
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未登录或无权限。

---

## **2. 用户社区模块 (Showcase)**

此模块用于管理用户发布的内容，包括帖子、评论和标签。

### **2.1. 标签管理**

#### **2.1.1. 创建标签**

- **Endpoint:** `POST /showcase/tags`
- **描述:** 创建一个新的标签。
- **认证:** 需要 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "name": "标签名称",
        "description": "标签描述"
    }
    ```
- **成功响应 (201 Created):** 返回创建的标签对象，包含 `id`, `name`, `description`。

#### **2.1.2. 获取所有标签**

- **Endpoint:** `GET /showcase/tags`
- **描述:** 获取所有可用标签的列表。
- **成功响应 (200 OK):** 返回一个包含标签对象的数组。

### **2.2. 帖子管理**

#### **2.2.1. 创建帖子**

- **Endpoint:** `POST /showcase/posts`
- **描述:** 用户发布一个新帖子。
- **认证:** 需要 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "title": "帖子标题",
        "content": "帖子内容",
        "images": ["image1.jpg", "image2.jpg"],
        "tagIds": [1, 2]
    }
    ```

    - 关联的标签ID数组
- **成功响应 (201 Created):** 返回创建的帖子对象，包含其 `id`。

#### **2.2.2. 获取帖子列表**

- **Endpoint:** `GET /showcase/posts`
- **描述:** 分页和排序获取帖子列表。
- **查询参数 (Query Parameters):**
    - `sortBy`: 排序方式 (例如: 'latest')。
    - `page`: 页码 (例如: 1)。
    - `pageSize`: 每页数量 (例如: 10)。
- **成功响应 (200 OK):**
    ```json
    {
        "items": [],
        "meta": {}
    }
    ```

    - `items` 为帖子对象数组，`meta` 为分页信息。

#### **2.2.3. 获取单个帖子详情**

- **Endpoint:** `GET /showcase/posts/:id`
- **描述:** 根据ID获取单个帖子的详细信息。
- **成功响应 (200 OK):** 返回完整的帖子对象。

### **2.3. 评论管理**

#### **2.3.1. 发表评论或回复**

- **Endpoint:** `POST /showcase/comments`
- **描述:** 对帖子发表评论，或对已有评论进行回复。
- **认证:** 需要 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "content": "评论内容",
        "postId": 1,
        "parentId": 2
    }
    ```

    - `postId` 为必需，关联的帖子ID
    - `parentId` 为可选，如果回复的是某条评论，则为父评论的ID
- **成功响应 (201 Created):** 返回创建的评论对象。

#### **2.3.2. 获取帖子的评论列表**

- **Endpoint:** `GET /showcase/posts/:id/comments`
- **描述:** 获取指定帖子的所有评论和回复。
- **成功响应 (200 OK):** 返回一个评论对象的数组（通常是树状结构）。

---

## **3. 盲盒模块 (CurioBox)**

此模块用于管理盲盒商品，大部分操作需要管理员权限。

### **3.1. 创建盲盒**

- **Endpoint:** `POST /curio-boxes/upload`
- **描述:** 创建一个新盲盒并上传封面图片。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **请求体 (multipart/form-data):**
    - 字段 `coverImage`：盲盒封面图片文件（支持 png、jpeg、jpg、gif、webp、bmp，最大5MB）
    - 其他字段同 `CreateCurioBoxDto`，如：
        - `name`: 盲盒名称
        - `description`: 盲盒描述
        - `price`: 价格
        - `category`: 类别
        - `itemIds`: 物品ID数组（可选）
        - `itemProbabilities`: 物品概率数组（可选）
- **示例请求 (form-data):**
  | key | value |
  |----------------|----------------------|
  | name | "盲盒名称" |
  | description | "盲盒描述" |
  | price | 99.99 |
  | category | "类别" |
  | itemIds | [1,2] |
  | itemProbabilities | [{{"itemId":1,"probability":0.7}}, ...] |
  | coverImage | (选择图片文件) |

- **成功响应 (201 Created):** 返回创建的盲盒对象，包含 `id`、`coverImage`（图片URL）、`items`、`itemProbabilities`。
  > 注意：`items` 字段为物品详情数组，只有后端查询时加 relations 才会返回，否则为空或 undefined。`itemProbabilities` 字段始终返回。
- **错误响应:**
    - `400 Bad Request`: 参数不合法或图片类型/大小不符合要求。
    - `401 Unauthorized`: 未登录。
    - `403 Forbidden`: 权限不足。

---

- **Endpoint:** `POST /curio-boxes`
- **描述:** 创建一个新盲盒（不带封面图片，仅用于兼容老接口或特殊场景）。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "name": "盲盒名称",
        "description": "盲盒描述",
        "price": 99.99,
        "category": "类别",
        "itemIds": [1, 2],
        "itemProbabilities": [
            { "itemId": 1, "probability": 0.7 },
            { "itemId": 2, "probability": 0.3 }
        ]
    }
    ```

    - `itemIds`、`itemProbabilities` 字段均为可选，允许不传或为空数组，表示创建空盲盒。
    - `itemProbabilities` 概率之和需为1，若有物品。
- **成功响应 (201 Created):** 返回创建的盲盒对象，包含 `id`、`items`、`itemProbabilities`。
- **错误响应:**
    - `403 Forbidden`: 普通用户尝试操作。
    - `400 Bad Request`: 概率和不为1或itemId非法。

### **3.1.1. 批量更新盲盒物品及概率**

- **Endpoint:** `PATCH /curio-boxes/:id/items-and-probabilities`
- **描述:** 批量更新指定盲盒的物品及其概率。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "itemIds": [1, 2],
        "itemProbabilities": [
            { "itemId": 1, "probability": 0.7 },
            { "itemId": 2, "probability": 0.3 }
        ]
    }
    ```

    - `itemIds`、`itemProbabilities` 字段均为可选，允许不传或为空数组，表示清空盲盒物品。
    - `itemProbabilities` 概率之和需为1，若有物品。
- **成功响应 (200 OK):** 返回更新后的盲盒对象，包含 `items`、`itemProbabilities`。
- **错误响应:**
    - `403 Forbidden`: 普通用户尝试操作。
    - `400 Bad Request`: 概率和不为1或itemId非法。

### **3.2. 获取所有盲盒**

- **Endpoint:** `GET /curio-boxes`
- **描述:** 获取所有盲盒的列表，无需登录。
- **成功响应 (200 OK):** 返回一个包含盲盒对象的数组。

### **3.3. 获取单个盲盒**

- **Endpoint:** `GET /curio-boxes/:id`
- **描述:** 根据ID获取单个盲盒的详细信息。
- **成功响应 (200 OK):** 返回单个盲盒对象。
- **错误响应:**
    - `404 Not Found`: 盲盒不存在。

### **3.4. 更新盲盒**

- **Endpoint:** `PATCH /curio-boxes/:id`
- **描述:** 更新指定盲盒的信息。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "name": "新的盲盒名称"
    }
    ```
- **成功响应 (200 OK):** 返回更新后的盲盒对象。
- **错误响应:**
    - `403 Forbidden`: 普通用户尝试操作。

### **3.5. 删除盲盒**

- **Endpoint:** `DELETE /curio-boxes/:id`
- **描述:** 删除一个盲盒。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **成功响应 (200 OK):** 操作成功。
- **错误响应:**
    - `403 Forbidden`: 普通用户尝试操作。
    - `404 Not Found`: 删除后再次查询时返回。

### **3.6. 搜索盲盒**

- **Endpoint:** `GET /curio-boxes/search`
- **描述:** 根据关键词搜索盲盒。
- **查询参数 (Query Parameters):**
    - `q`: 搜索关键词 (例如: 'UniqueBox')。
- **成功响应 (200 OK):** 返回匹配搜索关键词的盲盒对象数组。

---

## **3.7. 物品模块 (Item)**

此模块用于管理盲盒内的物品，支持多对多关联。

### **3.7.1. 创建物品**

- **Endpoint:** `POST /items/upload`
- **描述:** 创建一个新物品并上传图片，可关联到多个盲盒。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **请求体 (multipart/form-data):**
    - 字段 `image`：物品图片文件（支持 png、jpeg、jpg、gif、webp、bmp，最大5MB）
    - 其他字段同 `CreateItemDto`，如：
        - `name`: 物品名称
        - `category`: 类别
        - `stock`: 库存
        - `rarity`: 稀有度
        - `curioBoxIds`: 该物品所属的盲盒ID数组（可选）
- **示例请求 (form-data):**
  | key | value |
  |-------------|----------------------|
  | name | "物品名称" |
  | category | "类别" |
  | stock | 10 |
  | rarity | "rare" |
  | curioBoxIds | [1,2] |
  | image | (选择图片文件) |

- **成功响应 (201 Created):** 返回创建的物品对象，包含 `id`、`image`（图片URL）、`curioBoxes`。
- **错误响应:**
    - `400 Bad Request`: 参数不合法或图片类型/大小不符合要求。
    - `401 Unauthorized`: 未登录。
    - `403 Forbidden`: 权限不足。

---

- **Endpoint:** `POST /items`
- **描述:** 创建一个新物品（不带图片，仅用于兼容老接口或特殊场景）。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "name": "物品名称",
        "image": "http://example.com/item.png",
        "category": "类别",
        "stock": 10,
        "rarity": "稀有度",
        "curioBoxIds": [1, 2]
    }
    ```

    - `curioBoxIds`：该物品所属的盲盒ID数组，可为空。
- **成功响应 (201 Created):** 返回创建的物品对象，包含 `id`、`curioBoxes`。
- **错误响应:**
    - `400 Bad Request`: 参数不合法。

### **3.7.2. 获取所有物品**

- **Endpoint:** `GET /items`
- **描述:** 获取所有物品及其所属盲盒。
- **成功响应 (200 OK):** 返回物品对象数组，每个对象包含 `curioBoxes`。

### **3.7.3. 获取单个物品**

- **Endpoint:** `GET /items/:id`
- **描述:** 获取单个物品的详细信息。
- **成功响应 (200 OK):** 返回物品对象，包含 `curioBoxes`。
- **错误响应:**
    - `404 Not Found`: 物品不存在。

### **3.7.4. 更新物品**

- **Endpoint:** `PATCH /items/:id`
- **描述:** 更新物品信息及其所属盲盒。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "name": "新物品名称",
        "curioBoxIds": [1, 2]
    }
    ```

    - 可选字段，支持部分更新。
- **成功响应 (200 OK):** 返回更新后的物品对象。
- **错误响应:**
    - `404 Not Found`: 物品不存在。

### **3.7.5. 删除物品**

- **Endpoint:** `DELETE /items/:id`
- **描述:** 删除指定物品。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **成功响应 (200 OK):** 操作成功。
- **错误响应:**
    - `404 Not Found`: 物品不存在。

### **3.7.6. 修改物品库存**

- **Endpoint:** `PATCH /items/:id/stock`
- **描述:** 修改指定物品的库存数量。
- **权限:** 仅限管理员 (`admin`)。
- **认证:** 需要管理员的 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "stock": 20
    }
    ```
- **成功响应 (200 OK):** 返回更新后的物品对象。
- **错误响应:**
    - `404 Not Found`: 物品不存在。

---

## **4. 订单与盲盒仓库与个人物品仓库模块**

### **4.1. 购买盲盒**

- **Endpoint:** `POST /orders/purchase`
- **描述:** 购买盲盒到个人仓库，购买时即确定盲盒内容并扣减库存。
- **认证:** 需要用户 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "curioBoxId": 1,
        "quantity": 2 // 可选，默认为1
    }
    ```
- **成功响应 (201 Created):**
    ```json
    {
        "message": "购买成功",
        "order": {
            "id": 123,
            "price": "19.98",
            "status": "completed"
        },
        "userBoxes": [
            {
                "id": 1,
                "curioBoxId": 1,
                "status": "unopened",
                "purchaseDate": "2024-01-01T00:00:00Z"
            },
            {
                "id": 2,
                "curioBoxId": 1,
                "status": "unopened",
                "purchaseDate": "2024-01-01T00:00:00Z"
            }
        ]
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未登录。
    - `404 Not Found`: 盲盒不存在。
    - `400 Bad Request`: 物品库存不足。

### **4.2. 查看个人盲盒仓库**

- **Endpoint:** `GET /me/boxes`
- **描述:** 获取当前用户盲盒仓库列表。支持通过 `status` 查询参数筛选：
    - `status=UNOPENED`（默认）：未开启的盲盒
    - `status=OPENED`：已开启的盲盒
    - `status=ALL`：所有盲盒（无论开启与否）
- **认证:** 需要用户 Bearer Token。
- **查询参数 (Query Parameters):**
    - `status`（可选）：`UNOPENED` | `OPENED` | `ALL`，不传时默认为 `UNOPENED`
- **成功响应 (200 OK):**
    ```json
    {
        "boxes": [
            {
                "id": 1,
                "curioBox": {
                    "id": 1,
                    "name": "神秘盲盒",
                    "description": "...",
                    "price": "9.99"
                },
                "item": {
                    "id": 45,
                    "name": "稀有物品",
                    "image": "http://...",
                    "rarity": "rare"
                },
                "status": "unopened", // 或 "opened"
                "purchaseDate": "2024-01-01T00:00:00Z"
            }
        ]
    }
    ```
- **说明：**
    - `status=UNOPENED` 仅返回未开启的盲盒（原有行为）。
    - `status=OPENED` 返回已开启的盲盒。
    - `status=ALL` 返回所有盲盒。
    - 每个盲盒对象包含其关联的 `curioBox` 和（如已开启）`item` 信息。
- **错误响应:**
    - `401 Unauthorized`: 未登录。

### **4.3. 开启盲盒**

- **Endpoint:** `POST /me/boxes/open`
- **描述:** 开启指定的盲盒，显示购买时已确定的物品内容。
- **认证:** 需要用户 Bearer Token。
- **请求体 (Body):**
    ```json
    {
        "userBoxId": 1, // 单个开启
        "userBoxIds": [1, 2] // 批量开启（优先级高于userBoxId）
    }
    ```
- **成功响应 (200 OK):**
    ```json
    {
        "results": [
            {
                "userBoxId": 1,
                "drawnItem": {
                    "id": 45,
                    "name": "稀有物品",
                    "image": "http://...",
                    "rarity": "rare"
                },
                "success": true
            }
        ],
        "totalOpened": 1,
        "allSuccess": true
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未登录。
    - `404 Not Found`: 盲盒不存在。
    - `400 Bad Request`: 盲盒已被开启。

### **4.4. 获取当前用户的所有订单**

- **Endpoint:** `GET /orders`
- **描述:** 获取当前登录用户的所有订单列表。
- **认证:** 需要用户 Bearer Token。
- **成功响应 (200 OK):** 返回一个订单对象的数组。
- **错误响应:**
    - `401 Unauthorized`: 未登录。

### **4.5. 获取单个订单详情**

- **Endpoint:** `GET /orders/:id`
- **描述:** 获取单个订单的详细信息。用户只能查询自己的订单。
- **认证:** 需要用户 Bearer Token。
- **成功响应 (200 OK):** 返回包含详细信息的单个订单对象（包括关联的用户信息）。
- **错误响应:**
    - `401 Unauthorized`: 未登录。
    - `404 Not Found`: 订单不存在，或尝试访问不属于自己的订单。

### **4.6. 个人物品仓库（User Item）**

- **Endpoint:** `GET /me/items`
- **描述:** 获取当前用户拥有的所有物品及数量。
- **认证:** 需要用户 Bearer Token。
- **成功响应 (200 OK):**
    ```json
    {
        "items": [
            {
                "itemId": 45,
                "count": 2
            }
        ]
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未登录。

- **Endpoint:** `DELETE /me/items/:itemId?count=xx`
- **描述:** 删除或减少当前用户的指定物品数量。数量为 0 时自动删除该物品。
- **认证:** 需要用户 Bearer Token。
- **请求参数:**
    - `itemId`：物品ID（路径参数）
    - `count`：要减少的数量（查询参数，默认1）
- **成功响应 (200 OK):**
    ```json
    {
        "success": true,
        "deleted": true
    }
    ```
    或
    ```json
    {
        "success": true,
        "deleted": false,
        "count": 1
    }
    ```
- **错误响应:**
    - `401 Unauthorized`: 未登录。
    - `404 Not Found`: 物品不存在。

此模块处理用户的盲盒购买、个人仓库管理和开箱操作。
