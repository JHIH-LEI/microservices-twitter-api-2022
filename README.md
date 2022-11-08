# Simple Twitter API

# 專案由來

此專案用於練習Micro-service。[設計文件可至此觀看](https://drive.google.com/file/d/1uQ2Ee18g5XAUbHyk2Tj3koIMb2xSQWhY/view?usp=sharing)，記得用draw.io開啟，裡面包含了這次的設計流程。

<img width="766" alt="截圖 2022-11-08 下午2 59 47" src="https://user-images.githubusercontent.com/66233452/200496169-1fed58d3-c095-4db7-b971-651301f7e99e.png">

<img width="706" alt="截圖 2022-11-08 下午3 02 38" src="https://user-images.githubusercontent.com/66233452/200496582-f4a6f2be-e08f-4e6b-a147-ef35fcc05336.png">

### 專案前身

重構之前的[Monolithic Simple Twitter API repo 可點此](https://github.com/JHIH-LEI/twitter-api-2020)，[live demo點此](https://tzynwang.github.io/simple-twitter-frontend/#/login)，

# 專案介紹：

資料庫的選擇根據服務特性而選，分別採用了
* mysql
* mongodb
* redis：紀錄行為觸發者要通知的訂閱戶名單

未來若擴充訊息功能可以讓前端使用firebase的real time database，但針對房間的問題還需要重新設計。

因為是將服務分離，會有資料的問題需要處理，資料的同步利用了**async**的方法：**Event Bus**來處理，這邊採用了RabbitMQ來實作，為了處理concurrency的問題，在資料中加上version欄位來管理。


<img width="748" alt="截圖 2022-11-08 下午3 23 42" src="https://user-images.githubusercontent.com/66233452/200500246-3cf08d5e-f3fa-46c0-9d78-d7b6e8ee7f33.png">

管理不同容器使用了kubenete，詳細的設定檔可至infra/k8s查看，未來會在實作CICD的流程。

# 功能
前台：

* 使用者能新增推文、回覆推文、喜歡推文
* 使用者能追蹤/訂閱（類似於FB的通知）其他使用者
* 使用者能編輯個人資料（上傳背景及大頭照尚未實踐，未來希望是在優化方面能夠上傳到專門存放檔案的雲端服務，原本是仰賴開源服務，可見舊專案）
* 通知系統

（使用者驗證的邏輯打包成npm package讓每個服務都能用）

<img width="713" alt="截圖 2022-11-08 下午4 14 05" src="https://user-images.githubusercontent.com/66233452/200510334-63e188b8-4248-4fb7-b3ed-4f210b2a3a61.png">

<img width="753" alt="截圖 2022-11-08 下午3 34 45" src="https://user-images.githubusercontent.com/66233452/200502156-76a9d26f-f20b-4945-9e7d-825e2c23de75.png">

後台：(未實踐，前一個版本有做)

* 管理員能刪除推文
* 管理員能看見所有推文
* 管理員能看見所有使用者數據

# 專案設定

請先根據.env.example設定對應的值，每一個server都會有自己的.env檔，主要用來連線資料庫使用。

## 資料庫設定

* MySQL

1.為了能正確group資料，請先至SQL workbranch將ONLY_FULL_GROUP_BY限制移除
查看是否有ONLY_FULL_GROUP_BY
```
SELECT @@sql_mode; 
```
如果有就移除：
```
SET @@SESSION.sql_mode="STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION";
```
---
2.因為專案有設定unique constarin，如有跳出index column size too large錯誤
請至SQL workbranch將Character Set改為utf8 （如下圖）

![](https://i.imgur.com/SUPtoKt.png)

3.於SQL workbranch建立schema，如要命名其他記得到config/config.js更改
```
test-micro-twiiter-followship //test
test-micro-twiiter-subscribeship //test
dev-micro-twiiter-followship //dev
dev-micro-twiiter-subscribeship //dev
```

請記得在資料庫中新增Shcema，並更新你在.env中所設定的TEST_DB_URL, DEV_DB_URL, PROD_DB_URL

* Mongodb可以使用Robot3T，也一樣記得於.env新增跟改寫URL。
* Redis

# 啟動專案
下載專案到本地
```
git clone https://github.com/JHIH-LEI/microservices-twitter-api-2022.git
```
開啟終端機(Terminal)，進入存放此專案的資料夾
```
cd micro-twitter-api-2022
```
進入不同server的資料夾下載套件，common資料夾是npm module這個不用管。
```
npm install
```

### 不使用skaffold dev:

分別測試不同的server,進入要測的server執行：

啟動伺服器
```
npm run dev
```

在終端機看到以下字串代表伺服器建立成功：

```
Example app listening on port 3000!
```

### 使用skaffold dev 一次測試整個app

首先，進入每一個server去建立docker image + push到docker hub，第一次run skaffold之前一定要先建不然抓不到image，之後可以不用，讓skaffold自動幫我們更新。

```
docker build -t 你的docker hub帳號/micro-twitter-服務名稱（像是followships） .
docker push -t 你的docker hub帳號/micro-twitter-服務名稱（像是followships）
```

push成功後，記得去infra/k8s到對應的檔案更新image的名字！（舉例：）

<img width="1188" alt="截圖 2022-11-08 下午3 40 15" src="https://user-images.githubusercontent.com/66233452/200503181-15040d72-d5f9-460d-9c57-ef55b6ce0b83.png">

全部弄好了之後：

```
skaffold dev
```

在終端機有看到每個伺服器都成功監聽3000 port並沒有錯誤訊息就沒問題囉。


### 測試
進入想要測試的server資料夾（ex: followships）
執行
```
npm run test
```
