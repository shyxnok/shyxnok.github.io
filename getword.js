const request = require('request');
const fs = require('fs');

// 配置请求选项
const options = {
  'method': 'GET',
  'url': 'https://api.codelife.cc/yiyan/random?lang=cn',
  'headers': {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
  },
  timeout: 10000
};

// 存储所有获取到的不重复一言
const uniqueWords = [];
// 仅存储内容用于快速去重判断
const contentSet = new Set();

// 配置参数
const targetCount = 500; // 目标获取的不重复数量
const intervalTime = 3000; // 循环间隔时间(毫秒)

// 定义获取一言的函数
function fetchYiyan() {
  // 如果已获取足够数量的不重复内容，停止循环
  if (uniqueWords.length >= targetCount) {
    clearInterval(interval);
    saveResults();
    console.log(`已获取 ${targetCount} 条不重复的一言，程序结束`);
    return;
  }

  request(options, function (error, response) {
    try {
      if (error) throw new Error(`请求错误: ${error.message}`);
      if (response.statusCode !== 200) throw new Error(`状态码错误: ${response.statusCode}`);
      
      const yiyanData = JSON.parse(response.body);
      const content = yiyanData.data || '';
      
      // 检查是否重复
      if (content && !contentSet.has(content)) {
        // 不重复，添加到集合
        const word = {
          word: content.hitokoto,
          author: content.from || '未知',
        };
        
        uniqueWords.push(word);
        contentSet.add(content); // 将内容加入Set用于去重判断
        
        console.log(`已获取 ${uniqueWords.length}/${targetCount} 条 (不重复):`);
      } else {
        if (content) {
          console.log(`发现重复内容，已跳过: ${content.substring(0, 20)}...`);
        } else {
          console.log("获取到空内容，已跳过");
        }
      }
      
    } catch (err) {
      console.error('发生错误:', err.message);
    }
  });
}

// 保存结果到文件
function saveResults() {
  fs.writeFile(
    'yiyan.json',
    JSON.stringify(uniqueWords, null, 2),
    'utf8',
    (err) => {
      if (err) {
        console.error('保存文件失败:', err.message);
      } else {
        console.log(`所有不重复结果已保存到 yiyan_unique_collection.json`);
      }
    }
  );
}

// 开始循环获取
console.log(`将获取 ${targetCount} 条不重复的一言，每 ${intervalTime/1000} 秒尝试一次...\n`);
const interval = setInterval(fetchYiyan, intervalTime);

// 立即执行第一次获取
fetchYiyan();
