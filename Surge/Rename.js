return function (proxies) {
  // 1. 记录每个地区【普通节点】目前排到了第几号
  // 比如记录：Hong Kong -> 19, Singapore -> 05
  const maxIndexes = {};

  // 正则：匹配 "地区名+空格+数字" 结尾的节点
  // 兼容 "Hong Kong 01", "Singapore 5", "United States 12"
  const regexNormal = /^(.*?) 0?(\d+)$/;

  // 第一遍扫描：找出普通节点的最大序号
  proxies.forEach(p => {
    // 如果是 Premium 节点，先跳过，不参与统计
    if (p.name.includes('[Premium]')) return;

    const match = p.name.match(regexNormal);
    if (match) {
      const region = match[1].trim(); // 拿到地区名，如 "Hong Kong"
      const num = parseInt(match[2]); // 拿到数字，如 19
      
      // 更新该地区的最大编号
      if (!maxIndexes[region] || num > maxIndexes[region]) {
        maxIndexes[region] = num;
      }
    }
  });

  // 2. 第二遍扫描：给 Premium 节点重新编号
  const premiumCounters = {}; 

  return proxies.map(p => {
    // 只处理带 [Premium] 的节点
    if (!p.name.includes('[Premium]')) return p;

    // 提取地区名 (例如 "Hong Kong 21 [Premium]")
    // 逻辑：找到最后一个数字之前的所有文本作为地区名
    const match = p.name.match(/^(.*?) \d+/);
    
    if (match) {
      const region = match[1].trim();
      
      // 获取该地区目前的【普通节点最大编号】
      const currentMax = maxIndexes[region] || 0;
      
      // 计数器 +1 (这是该地区的第几个 Premium 节点)
      if (!premiumCounters[region]) premiumCounters[region] = 0;
      premiumCounters[region]++;
      
      // 新编号 = 普通最大值 + 当前计数
      const newNum = currentMax + premiumCounters[region];
      
      // 补齐前导零 (如果小于10，前面加个0)
      const newNumStr = newNum < 10 ? "0" + newNum : "" + newNum;
      
      // 修改名字
      p.name = `${region} ${newNumStr} [Premium]`;
    }
    return p;
  });
}