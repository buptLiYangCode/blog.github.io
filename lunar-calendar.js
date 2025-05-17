/**
 * 农历日期转换工具
 * 用于农历和阳历日期之间的转换
 */

// 农历年份数据，每个数字的二进制表示对应当年农历月份大小（大月30天，小月29天）
// 数据格式为：[闰月位置(0为无闰月), 春节日期(距离当年元旦的天数)]
const lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
    0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6, // 1970-1979
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0  // 2040-2049
];

// 传统农历节日
const festivals = {
    '正月初一': '春节',
    '正月十五': '元宵节',
    '五月初五': '端午节',
    '七月初七': '七夕节',
    '八月十五': '中秋节',
    '九月初九': '重阳节',
    '腊月三十': '除夕',
    // 可以添加更多传统节日
};

// 月份汉字
const monthChinese = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
// 日期汉字
const dayChinese = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

/**
 * 获取农历年的总天数
 * @param {Number} year 农历年
 * @returns {Number} 该年的总天数
 */
function getLunarYearDays(year) {
    let i, sum = 348;
    for(i=0x8000; i>0x8; i>>=1) {
        sum += (lunarInfo[year-1900] & i) ? 1 : 0;
    }
    return sum + leapDays(year);
}

/**
 * 获取农历年的闰月月份
 * @param {Number} year 农历年
 * @returns {Number} 闰月的月份，0表示无闰月
 */
function leapMonth(year) {
    return lunarInfo[year-1900] & 0xf;
}

/**
 * 获取农历年闰月的天数
 * @param {Number} year 农历年
 * @returns {Number} 该年闰月的天数，0表示无闰月
 */
function leapDays(year) {
    if(leapMonth(year)) {
        return (lunarInfo[year-1900] & 0x10000) ? 30 : 29;
    }
    return 0;
}

/**
 * 获取农历年某月的天数
 * @param {Number} year 农历年
 * @param {Number} month 农历月
 * @returns {Number} 该月的天数
 */
function monthDays(year, month) {
    return (lunarInfo[year-1900] & (0x10000 >> month)) ? 30 : 29;
}

/**
 * 公历日期转农历日期
 * @param {Date} date 公历日期对象
 * @returns {Object} 农历日期对象
 */
function solarToLunar(date) {
    let leap = 0, temp = 0;
    let baseDate = new Date(1900, 0, 31);
    let offset = Math.floor((date - baseDate) / 86400000);
    
    let year = 1900;
    while(offset > 0 && year < 2050) {
        temp = getLunarYearDays(year);
        if(offset < temp) {
            break;
        }
        offset -= temp;
        year++;
    }
    
    let lunarYear = year;
    
    // 农历年的闰月
    let leapM = leapMonth(year);
    let isLeap = false;
    
    let month = 1;
    while(offset > 0 && month < 13) {
        // 闰月
        if(leapM > 0 && month === leapM + 1 && !isLeap) {
            temp = leapDays(year);
            isLeap = true;
        } else {
            temp = monthDays(year, month);
        }
        
        // 解除闰月
        if(isLeap && month === leapM + 1) {
            isLeap = false;
        }
        
        if(offset < temp) {
            break;
        }
        
        offset -= temp;
        if(!isLeap) {
            month++;
        }
    }
    
    let lunarMonth = month;
    let lunarDay = offset + 1;
    
    // 转换为中文表示
    const monthStr = monthChinese[lunarMonth - 1];
    const dayStr = dayChinese[lunarDay - 1];
    
    return {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay,
        isLeap: isLeap,
        monthStr: monthStr,
        dayStr: dayStr,
        festival: festivals[monthStr + dayStr] || ''
    };
}

/**
 * 获取今年农历日期的阳历日期
 * @param {Number} month 农历月
 * @param {Number} day 农历日
 * @returns {Date} 阳历日期
 */
function getLunarDateInCurrentYear(month, day) {
    const currentYear = new Date().getFullYear();
    return getLunarDateInYear(currentYear, month, day);
}

/**
 * 获取指定年份农历日期的阳历日期
 * @param {Number} year 阳历年
 * @param {Number} lunarMonth 农历月
 * @param {Number} lunarDay 农历日
 * @returns {Date} 阳历日期
 */
function getLunarDateInYear(year, lunarMonth, lunarDay) {
    // 从当年元旦开始查找对应的农历日期
    let date = new Date(year, 0, 1);
    let endDate = new Date(year + 1, 0, 1);
    
    while(date < endDate) {
        let lunar = solarToLunar(date);
        if(lunar.month === lunarMonth && lunar.day === lunarDay) {
            return date;
        }
        date.setDate(date.getDate() + 1);
    }
    
    return null; // 没找到对应日期
}

/**
 * 解析农历字符串 (例如: "农历 12.28")
 * @param {String} lunarStr 农历日期字符串
 * @returns {Object} 包含月份和日期的对象
 */
function parseLunarString(lunarStr) {
    // 分离月日 (格式示例: "农历 12.28")
    const dateStr = lunarStr.split(' ')[1];
    const parts = dateStr.split('.');
    
    if(parts.length === 2) {
        return {
            month: parseInt(parts[0], 10),
            day: parseInt(parts[1], 10)
        };
    }
    
    return null;
}

/**
 * 计算农历生日的公历日期
 * @param {String} birthStr 生日字符串 (例如: "妈妈 农历 12.28")
 * @returns {Date} 今年对应的公历日期
 */
function calculateLunarBirthday(birthStr) {
    const parts = birthStr.split(' ');
    if(parts.length >= 3 && parts[1] === "农历") {
        const lunarDate = parseLunarString("农历 " + parts[2]);
        if(lunarDate) {
            return getLunarDateInCurrentYear(lunarDate.month, lunarDate.day);
        }
    }
    return null;
}

/**
 * 解析阳历生日字符串 (例如: "爸爸 阳历 5.12")
 * @param {String} birthStr 生日字符串
 * @returns {Date} 今年对应的公历日期
 */
function parseSolarBirthday(birthStr) {
    const parts = birthStr.split(' ');
    if(parts.length >= 3) {
        const dateStr = parts[2];
        const dateParts = dateStr.split('.');
        if(dateParts.length === 2) {
            const month = parseInt(dateParts[0], 10) - 1;  // 月份从0开始
            const day = parseInt(dateParts[1], 10);
            
            const currentYear = new Date().getFullYear();
            return new Date(currentYear, month, day);
        }
    }
    return null;
}

// 导出功能
window.LunarCalendar = {
    solarToLunar,
    calculateLunarBirthday,
    parseSolarBirthday
}; 