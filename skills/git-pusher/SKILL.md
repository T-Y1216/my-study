# Git Pusher Skill

## 简介

`git-pusher` 是一个用于将本地作业/项目代码推送到指定 GitHub 仓库的 skill。它的核心目标是：**所有作业统一推送到同一个仓库**，不创建新仓库。

## 使用场景

- 完成作业后需要提交到 GitHub
- 需要统一、规范的 git 提交流程
- 避免每次作业都新建仓库（这是作业要求，新建仓库会扣分）

## 工作流程

执行推送时，按以下标准步骤操作：

1. **确认仓库路径**：进入目标仓库目录（如 `C:\Users\HP\Desktop\my-study-course\my-study`）
2. **检查远程仓库**：
   ```powershell
   git remote -v
   ```
3. **拉取最新代码**（防止冲突）：
   ```powershell
   git pull origin <分支名>
   ```
4. **添加更改**：
   ```powershell
   git add .
   ```
5. **提交更改**：
   ```powershell
   git commit -m "<commit message>"
   ```
6. **推送到远程**：
   ```powershell
   git push origin <分支名>
   ```
7. **返回 commit 记录链接**，例如：
   ```
   T-Y1216/my-study@a1b2c3d
   ```

## 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `repo_path` | 本地仓库的绝对路径 | 当前工作目录 |
| `commit_message` | 本次提交的说明文字 | `添加/更新作业内容` |
| `branch` | 远程分支名称 | `main` |

## 使用示例

### 示例 1：推送 JS 基础作业

```
使用 git-pusher skill 将 C:\Users\HP\Desktop\my-study-course\my-study 推送到 GitHub，commit 信息为"添加JS基础练习页面"。
```

### 示例 2：快速推送当前目录

```
用 git-pusher skill 推送当前目录，commit 写"更新课堂作业"。
```

## 注意事项

1. **绝不新建仓库**：所有作业必须推送到已有仓库（如 `T-Y1216/my-study`）
2. **commit 信息要清晰**：让老师能看明白这次提交做了什么
3. **推送前先 pull**：避免多人协作或跨设备提交时产生冲突
4. **如遇网络问题**：可配置 `http.version` 为 `HTTP/1.1` 或重试
5. **返回值**：推送成功后，返回 GitHub 的 commit 记录链接作为提交凭证

## 脚本模板（PowerShell）

```powershell
param(
    [string]$RepoPath = (Get-Location),
    [string]$CommitMessage = "添加/更新作业内容",
    [string]$Branch = "main"
)

Set-Location $RepoPath

# 检查是否是 git 仓库
if (-not (Test-Path .git)) {
    Write-Error "当前目录不是 Git 仓库，请确认路径。"
    exit 1
}

# 拉取更新
git pull origin $Branch

# 添加并提交
if (git status --porcelain) {
    git add .
    git commit -m "$CommitMessage"
    git push origin $Branch
    
    # 获取最新 commit hash
    $hash = git rev-parse --short HEAD
    Write-Output "推送成功！Commit 记录: $hash"
} else {
    Write-Output "没有需要提交的更改。"
}
```
