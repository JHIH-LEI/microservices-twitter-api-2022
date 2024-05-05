# Simple Twitter API Project Background

This project is aimed at practicing Micro-service architecture. [Design documents can be viewed here](https://drive.google.com/file/d/1uQ2Ee18g5XAUbHyk2Tj3koIMb2xSQWhY/view?usp=sharing), make sure to open them with draw.io, as they contain the design flow for this project.

[Test file records](https://docs.google.com/spreadsheets/d/1b6o0sJsoG7D1afKGW2jFwDmLbTK6MJdR0QmhvV3AjcU/edit?usp=sharing)

## Project Predecessor

Refactoring from the previous [Monolithic Simple Twitter API repo](https://github.com/JHIH-LEI/twitter-api-2020) , [live demo](https://tzynwang.github.io/simple-twitter-frontend/#/login).

Before：
<img width="766" alt="截圖 2022-11-08 下午2 59 47" src="https://user-images.githubusercontent.com/66233452/200496169-1fed58d3-c095-4db7-b971-651301f7e99e.png">

After：
![](https://i.imgur.com/QLcSoca.png)

## Project Introduction：

The choice of databases is based on service characteristics, including:

* mysql
* mongodb
* redis: Records the subscriber list that behavior triggers need to notify.

For future message function expansion, the frontend can use Firebase's real-time database, but regarding room issues, a redesign is still necessary.

Because services are separated, there are data issues to address. Data synchronization utilizes asynchronous methods: Event Bus for handling. RabbitMQ is employed here. To manage concurrency issues, a version field is added to the data.


![](https://i.imgur.com/ALDk5u1.png)

In terms of event publishing, hooks are mainly utilized.

To facilitate the management of different containers, Kubernetes is adopted. Detailed configuration files can be found in infra/k8s. CI/CD workflows will be implemented in the future.

## Features

(User authentication logic packaged into an npm package for use by each service)

Frontend:

* Users can create tweets, reply to tweets, and like tweets.
* Users can follow/subscribe (similar to FB notifications) to other users.
* Users can edit their profile (uploading background and profile pictures not yet implemented, hoping for future optimization to upload to specialized cloud storage services; originally relied on open-source services, as seen in the old project).
* Notification system.

![](https://i.imgur.com/AgOEaCq.png)


Notify Server：

![](https://i.imgur.com/FEfej46.png)


![](https://i.imgur.com/OaLb6al.png)


Backend: (Not implemented, done in the previous version)

* Administrators can delete tweets.
* Administrators can see all tweets.
* Administrators can see all user data.

## Project Startup

### Step0: Download the Project

Download the project to your local machine:
```
git clone https://github.com/JHIH-LEI/microservices-twitter-api-2022.git
```
Open Terminal and navigate to the folder where this project is stored:
```
cd micro-twitter-api-2022
```


### Step1: Configure Kubernetes Secret

First, find secret.yaml.example and database-secret.yaml.example in infra/k8s. Remove the "example" from the filename and fill in the missing values (encrypted using base64).

You can obtain the base64 value using the following command:

```
echo -n putValueHere | base64
```

### Step2: Modify the Hosts File to Map the Ingress Host to 127.0.0.1

```
cd ~
```

```
cd /etc
```

```
code hosts
```

Add: 

127.0.0.1 twitter.dev

After saving, a prompt will appear in the lower-right corner:
![](https://i.imgur.com/EPMC7Os.png)
Click "Retry," and it will prompt for a password to restart and apply the update.

### Step3: Use Skaffold to Set Up Kubernetes

Navigate to the root directory and run:

```
skaffold dev
```

Once you see the services listed as "listening on 3000" in the terminal, it means it's successful:

![](https://i.imgur.com/JdPw9eE.png)
![](https://i.imgur.com/0DjnjFV.png)

Now, you can access our backend API service using twitter.dev!

You can test it using Postman:
![](https://i.imgur.com/qjdjvy6.png)


### Other Startup Methods - Running Individual Services without Skaffold:
We will use an .env file to set up the environment variables needed for each service. Please rename the .env.example file to .env under the src folder of the corresponding service and fill in the values.

Start the server:
```
npm run dev
```

If you see the following message in the terminal, it means the server has been successfully established:

```
Example app listening on port 3000!
```

Run tests:
```
npm run test:ci
```

---
### Additional Information: What to Do If You Encounter Errors When Using Skaffold Dev?

Sometimes, simply restarting may resolve the issue, but it could also be due to a failed image pull. While Skaffold automates sync, build, test, and deploy, it requires predefined images to start the automation process.

In this case, you can try building your own image and pushing it to Docker Hub for use. Remember to update the image name in the corresponding Kubernetes deployment.

Detailed Instructions:

First, navigate to each server to build the Docker image:

```
cd tweets
docker build -t yourDocerId/imageName .
```

Push to Docker Hub

```
docker push yourDocerId/imageName
```

Update the image location in the corresponding Kubernetes deployment:

![](https://i.imgur.com/1kX3aeV.png)


Once everything is set up, return to the root directory and run:

```
skaffold dev
```

If you see each server successfully listening on port 3000 in the terminal without any error messages, everything is working fine.


# 中文版本

# 專案由來

此專案用於練習Micro-service。[設計文件可至此觀看](https://drive.google.com/file/d/1uQ2Ee18g5XAUbHyk2Tj3koIMb2xSQWhY/view?usp=sharing)，記得用draw.io開啟，裡面包含了這次的設計流程。

[測試檔案紀錄](https://docs.google.com/spreadsheets/d/1b6o0sJsoG7D1afKGW2jFwDmLbTK6MJdR0QmhvV3AjcU/edit?usp=sharing)

[專案總覽簡介](https://alicialin2020.medium.com/%E6%88%91%E7%9A%84%E7%AC%AC%E4%B8%80%E5%80%8Bmicroservices-%E5%B0%88%E6%A1%88%E5%9B%9E%E9%A1%A7-cdab8dbc82f)

### 專案前身

重構之前的[Monolithic Simple Twitter API repo 可點此](https://github.com/JHIH-LEI/twitter-api-2020)，[live demo點此](https://tzynwang.github.io/simple-twitter-frontend/#/login)，

Before：
<img width="766" alt="截圖 2022-11-08 下午2 59 47" src="https://user-images.githubusercontent.com/66233452/200496169-1fed58d3-c095-4db7-b971-651301f7e99e.png">

After：
![](https://i.imgur.com/QLcSoca.png)

# 專案介紹：

資料庫的選擇根據服務特性而選，分別採用了
* mysql
* mongodb
* redis：紀錄行為觸發者要通知的訂閱戶名單

未來若擴充訊息功能可以讓前端使用firebase的real time database，但針對房間的問題還需要重新設計。

因為是將服務分離，會有資料的問題需要處理，資料的同步利用了**async**的方法：**Event Bus**來處理，這邊採用了RabbitMQ來實作，為了處理concurrency的問題，在資料中加上version欄位來管理。


![](https://i.imgur.com/ALDk5u1.png)

# 功能
（使用者驗證的邏輯打包成npm package讓每個服務都能用）
前台：

* 使用者能新增推文、回覆推文、喜歡推文
* 使用者能追蹤/訂閱（類似於FB的通知）其他使用者
* 使用者能編輯個人資料（上傳背景及大頭照尚未實踐，未來希望是在優化方面能夠上傳到專門存放檔案的雲端服務，原本是仰賴開源服務，可見舊專案）
* 通知系統


![](https://i.imgur.com/AgOEaCq.png)


Notify Server：

![](https://i.imgur.com/FEfej46.png)


![](https://i.imgur.com/OaLb6al.png)



後台：(未實踐，前一個版本有做)

* 管理員能刪除推文
* 管理員能看見所有推文
* 管理員能看見所有使用者數據


# 啟動專案 


## Step0: 下載此專案

下載專案到本地
```
git clone https://github.com/JHIH-LEI/microservices-twitter-api-2022.git
```
開啟終端機(Terminal)，進入存放此專案的資料夾
```
cd micro-twitter-api-2022
```


## Step1: 設定Kubenete Secret

首先，請在infra/k8s 找到secret.yaml.example以及database-secret.yaml.example，把example結尾去除，並將缺少的值補齊（需使用base64加密）。

base64的值可以利用以下指令拿到：

```
echo -n putValueHere | base64
```

## Step2: 修改host檔，將ingress中寫的host map到127.0.0.1

```
cd ~
```

```
cd /etc
```

```
code hosts
```

加上
127.0.0.1 twitter.dev

存檔後，右下會跳出：
![](https://i.imgur.com/EPMC7Os.png)
點選Retry後他會要求輸入密碼，就會幫我們重啟來應用這次的更新了。

## Step3: 利用skaffold幫我們建好k8s

到root dir運行：

```
skaffold dev
```

接著在終端機看到服務打印出listing on 3000就代表成功囉：

![](https://i.imgur.com/JdPw9eE.png)
![](https://i.imgur.com/0DjnjFV.png)
接著我們就能利用twitter.dev來訪問我們的後端api服務囉！

可以利用postman來做測試：

![](https://i.imgur.com/qjdjvy6.png)

## 其他啟動方式-- 不使用skaffold，獨立測試單個服務:

我們會利用.env file設定服務所需要的環境變數，請先在對應的服務其src資料夾底下，將.env.example改成.env，並填補值。


啟動伺服器
```
npm run dev
```

在終端機看到以下字串代表伺服器建立成功：

```
Example app listening on port 3000!
```

執行測試：
```
npm run test:ci
```

---

補充資料： 如果在使用skaffold dev 時遇到錯誤怎麼辦？

有時候只要重啟就沒事了，但也有可能是因為pull image失敗，skaffold雖然會幫我們自動sync, build, test, deploy，但在開始自動化流程之前，我們必須先有既定的image讓他能夠開始。

此時你可以嘗試自己建好image並推至docker hub來使用，請記得去對應的k8s depl把image的名稱改成你的。

詳細步驟指示：

首先，進入每一個server去建立docker image

```
cd tweets
docker build -t yourDocerId/imageName .
```

推到Docker Hub

```
docker push yourDocerId/imageName
```

至相對應的k8s depl 修改image位置


![](https://i.imgur.com/1kX3aeV.png)


全部弄好了之後，回到root directory執行：

```
skaffold dev
```

在終端機有看到每個伺服器都成功監聽3000 port並沒有錯誤訊息就沒問題囉。

