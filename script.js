// 假设 lunar-calendar.js 已经引入并在全局可用，或者您使用模块方式引入
// 例如: import { calendar } from './lunar-calendar.js'; // (需要调整lunar-calendar.js以支持ES6模块)

document.addEventListener('DOMContentLoaded', () => {
    // --- 数据定义 ---
    const wallpapers = [
        "https://img.picui.cn/free/2025/05/26/68346a0cae79a.jpg", // 示例图床 API，您可以替换成您的图床链接
    ];

    const birthdays = [
        { name: "妈妈", type: "lunar", date: "12.28" }, // 农历12月28日
        { name: "弟弟", type: "lunar", date: "10.01" }, // 阳历10月01日
        // 添加更多生日
    ];

    const messages = [
        { text: "困难是上天包装过的奖励。", date: "2025.5.26" },
        { text: "世上没有绝望的处境，只有对处境绝望的人。", date: "2025.5.26" },
        { text: "早睡早起，好的习惯能帮你度过难关。", date: "2025.5.26" },
        // 添加更多话语
    ];

    const schedule = [
        { event: "毕设答辩", datetime: "2025.5.29#13:30" },
        // 添加更多日程
    ];

    // --- DOM元素获取 ---
    const dateDisplay = document.getElementById('date-display');
    const timeDisplay = document.getElementById('time-display');
    const birthdaysList = document.getElementById('birthdays-list');
    const messagesList = document.getElementById('messages-list');
    const scheduleList = document.getElementById('schedule-list');
    const bodyElement = document.body;

    // --- 功能函数 ---

    // 1. 更新日期和时间
    function updateDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 月份从1开始
        const day = now.getDate();

        const displayMonth = month.toString().padStart(2, '0');
        const displayDay = day.toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');

        let gregorianDateStr = `${year}年${displayMonth}月${displayDay}日`;

        // 添加农历显示
        try {
            if (typeof calendar !== 'undefined' && calendar.solarToLunar) {
                const lunarDate = calendar.solarToLunar(year, month, day);
                // lunarDate 对象通常包含 lunarYear, lunarMonthName, lunarDayName 等属性
                // 例如: 农历 二月 初三  或者  农历 闰二月 初三
                // 有些库可能直接给出如 '二月初三' 的组合字符串，请根据您使用的库调整
                let lunarDateStr = ` (农历 ${lunarDate.lunarMonthName}${lunarDate.lunarDayName})`;
                if(lunarDate.isleap) { // 如果是闰月
                    lunarDateStr = ` (农历 闰${lunarDate.lunarMonthName}${lunarDate.lunarDayName})`;
                }
                gregorianDateStr += lunarDateStr;
            } else {
                console.warn("农历库未加载，无法显示农历日期。");
            }
        } catch (e) {
            console.error("转换农历日期时出错:", e);
        }

        dateDisplay.textContent = gregorianDateStr;
        timeDisplay.textContent = `${hours} : ${minutes}`;
    }

    // 2. 设置随机壁纸
    function setRandomWallpaper() {
        if (wallpapers.length > 0) {
            const randomIndex = Math.floor(Math.random() * wallpapers.length);
            bodyElement.style.backgroundImage = `url('${wallpapers[randomIndex]}')`;
        }
    }

    // 3. 加载生日信息
    function loadBirthdays() {
        birthdaysList.innerHTML = ''; // 清空现有列表
        birthdays.forEach(b => {
            const li = document.createElement('li');
            li.classList.add('birthday-entry');
            // 将类型和日期包裹在一个新的 span 中，用于右侧对齐
            li.innerHTML = `<span class="birthday-name-main">${b.name}</span>` +
                           `<span class="birthday-info-group">` +
                               `<span class="birthday-details">${b.type === 'lunar' ? '农历' : '阳历'}</span>` +
                               `<span class="birthday-original-date">${b.date}</span>` +
                           `</span>`;
            birthdaysList.appendChild(li);
        });
    }

    // 4. 加载想说的话
    function loadMessages() {
        messagesList.innerHTML = ''; // 清空现有列表
        // 按日期排序（可选，如果需要的话）
        messages.sort((a,b) => new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-')));

        messages.forEach(msg => {
            const li = document.createElement('li');
            const contentSpan = document.createElement('span');
            contentSpan.classList.add('content');
            contentSpan.textContent = msg.text;
            
            const dateTagSpan = document.createElement('span');
            dateTagSpan.classList.add('date-tag');
            dateTagSpan.textContent = msg.date;
            
            li.appendChild(contentSpan);
            li.appendChild(dateTagSpan);
            messagesList.appendChild(li);
        });
    }

    // 5. 加载日程
    function loadSchedule() {
        scheduleList.innerHTML = ''; // 清空现有列表
        // 可以按日期时间排序
        schedule.sort((a,b) => {
            const dateA = new Date(a.datetime.replace('#', ' ').replace(/\./g, '-'));
            const dateB = new Date(b.datetime.replace('#', ' ').replace(/\./g, '-'));
            return dateA - dateB;
        });

        schedule.forEach(item => {
            const li = document.createElement('li');
            const [datePart, timePart] = item.datetime.split('#');
            
            const contentSpan = document.createElement('span');
            contentSpan.classList.add('content');
            contentSpan.textContent = item.event;
            
            const dateTimeTagSpan = document.createElement('span');
            dateTimeTagSpan.classList.add('date-tag'); // 复用样式
            dateTimeTagSpan.textContent = `${datePart} ${timePart}`;
            
            li.appendChild(contentSpan);
            li.appendChild(dateTimeTagSpan);
            scheduleList.appendChild(li);
        });
    }


    // --- 初始化调用 ---
    setRandomWallpaper(); // 初始设置壁纸
    updateDateTime(); // 初始更新时间
    setInterval(updateDateTime, 1000 * 30); // 每30秒更新一次时间，避免过于频繁

    // 确保农历库加载完成后再加载生日
    // 这是一个简化的处理，实际中您可能需要更健壮的库加载检测
    if (typeof calendar !== 'undefined' && calendar.lunarToSolar) {
        loadBirthdays();
    } else {
        console.error("农历转换库 (calendar) 未找到或未正确加载。生日模块可能无法正常显示农历生日。");
        // 可以尝试只加载阳历生日，或者提示用户
        // 为了简单起见，这里我们假设如果库不存在，农历生日部分会 gracefully fail (如 loadBirthdays 中处理)
        loadBirthdays(); // 尝试加载，让其内部处理错误
    }
    
    loadMessages();
    loadSchedule();

    // 可以设置壁纸定时更换
    // setInterval(setRandomWallpaper, 1000 * 60 * 30); // 每30分钟换一次壁纸
});

// 简易的农历转换函数占位符 - 您需要引入一个实际的农历库
// 例如：https://github.com/seeconf/lunar (lunar-calendar.js)
// 或者使用更现代的库如 https://github.com/jjonline/calendar.js (需要调整API调用)
// 以下是一个非常非常基础的示例，不能用于实际生产，仅为让代码能跑通结构
if (typeof calendar === 'undefined') {
    console.warn("警告：未找到 'calendar' 对象。农历转换将不可用。请引入一个农历库。");
    var calendar = {
        lunarToSolar: function(year, month, day) {
            // 这是一个 **错误的、仅供占位** 的实现
            // 请务必替换为真实的农历转换库
            console.error("您正在使用一个占位的农历转换函数。请替换为真实的农历库！");
            if (month === 12 && day === 28 && year === new Date().getFullYear()) { // 粗略模拟妈妈的生日
                 // 返回一个近似的阳历日期，例如当年1月或2月，具体取决于农历
                 // 这只是为了避免完全崩溃，实际日期会不准
                let d = new Date(year, 1, 15); // 假设一个日期
                return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
            }
            // 对于其他农历日期，抛出错误或返回一个明显错误的值
            // throw new Error("农历转换功能未实现或库未加载");
            // 或者返回一个使日期计算明显错误的值
            const fallbackDate = new Date(year, month -1, day); // 直接用阳历月份，会不准
             return { year: fallbackDate.getFullYear(), month: fallbackDate.getMonth() + 1, day: fallbackDate.getDate() };
        }
    };
} 