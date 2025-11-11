# 用戶角色管理腳本

這些腳本用於檢查和更新用戶的角色。

## 檢查用戶角色

檢查指定用戶的當前角色：

```bash
cd backend
npx ts-node scripts/check-user-role.ts <email>
```

示例：
```bash
npx ts-node scripts/check-user-role.ts user@example.com
```

## 更新用戶角色

將用戶角色更新為 ADMIN 或 USER：

```bash
cd backend
npx ts-node scripts/update-user-role.ts <email> <role>
```

示例（設置為管理員）：
```bash
npx ts-node scripts/update-user-role.ts user@example.com ADMIN
```

示例（設置為普通用戶）：
```bash
npx ts-node scripts/update-user-role.ts user@example.com USER
```

## 注意事項

1. 更新角色後，用戶需要**重新登錄**才能使更改生效
2. 只有 ADMIN 角色的用戶才能訪問管理員功能
3. 默認的管理員帳號：`admin@example.com`（密碼：`Admin123!`）

## 故障排除

如果遇到 403 Forbidden 錯誤：

1. 檢查用戶角色：
   ```bash
   npx ts-node scripts/check-user-role.ts <your-email>
   ```

2. 如果角色不是 ADMIN，更新它：
   ```bash
   npx ts-node scripts/update-user-role.ts <your-email> ADMIN
   ```

3. 登出並重新登錄

4. 檢查後端日誌中的調試信息（應該會顯示用戶角色）



