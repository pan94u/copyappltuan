# 报价小爬虫
服务端express+cheerio，前端ejs，样式bootstrap库
<h3>特点：</h3>
使用nodejs自带router组件获取appletuan的最新报价，使用cheerio处理数据并回传到客户端<br>
请求appletuan时返回速度较慢，故每次请求会生成一个时效为1小时的缓存报价，增强体验<br>
当进入新一天并且appletuan未产生新报价，将自动展示最近一次的报价<br>
报价支持历史趋势查询<br>
自动适配移动端<br>
--20180130更新：增加历史报价趋势
<a href="http://price.ppsm.club">demo</a>
# 页面截图
报价页 
![报价页](http://price.ppsm.club/img/price.png)
价格趋势 
![Image text](http://price.ppsm.club/img/charts.png)
