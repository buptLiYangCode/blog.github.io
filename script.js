// DOM元素
const currentDateEl = document.getElementById('current-date');
const currentTimeEl = document.getElementById('current-time');
const birthdayListEl = document.getElementById('birthday-list');
const scheduleListEl = document.getElementById('schedule-list');
const messageContentEl = document.getElementById('message-content');

// 文件名
const FILE_NAMES = {
    BIRTHDAYS: 'birthdays.txt',
    SCHEDULES: 'schedules.txt',
    MESSAGE: 'messages.txt'
};

// 背景轮播计时器
let backgroundInterval;

// 初始化
function init() {
    updateDateTime();
    setupBackgroundRotation();
    loadMessageFromFile();
    loadBirthdaysFromFile();
    loadSchedulesFromFile();
    
    // 设置定时器每秒更新时间
    setInterval(updateDateTime, 1000);
}

// 设置背景图片轮播
function setupBackgroundRotation() {
    // 获取images文件夹中的图片
    fetchImagesList()
        .then(images => {
            if (images && images.length > 0) {
                startImageRotation(images);
            } else {
                // 使用默认背景
                document.body.style.backgroundImage = 'linear-gradient(135deg, #3498db, #8e44ad)';
            }
        })
        .catch(error => {
            console.error('背景图片加载失败:', error);
            // 使用默认背景
            document.body.style.backgroundImage = 'linear-gradient(135deg, #3498db, #8e44ad)';
        });
}

// 获取images文件夹中的所有图片
function fetchImagesList() {
    return new Promise((resolve) => {
        // 尝试读取常见图片格式
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const imagePaths = [];
        
        // 提取images文件夹内的图片
        for (let i = 1; i <= 10; i++) { // 假设最多有10张图片，可以根据需要调整
            for (const ext of imageExtensions) {
                imagePaths.push(`images/bg${i}.${ext}`);
            }
        }
        
        // 验证图片是否存在
        Promise.all(
            imagePaths.map(path => 
                fetch(path, { method: 'HEAD' })
                    .then(response => response.ok ? path : null)
                    .catch(() => null)
            )
        )
        .then(results => {
            const validImages = results.filter(path => path !== null);
            resolve(validImages);
        });
    });
}

// 开始图片轮播
function startImageRotation(images) {
    if (images.length === 0) return;
    
    // 随机选择起始图片
    let currentIndex = Math.floor(Math.random() * images.length);
    document.body.style.backgroundImage = `url('${images[currentIndex]}')`;
    
    // 清除之前的定时器
    if (backgroundInterval) {
        clearInterval(backgroundInterval);
    }
    
    // 设置10秒自动轮播
    backgroundInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        document.body.style.transition = 'background-image 1s ease-in-out';
        document.body.style.backgroundImage = `url('${images[currentIndex]}')`;
    }, 10000);
}

// 更新日期和时间
function updateDateTime() {
    const now = new Date();
    
    // 格式化日期：2023年10月21日 星期六
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    currentDateEl.textContent = now.toLocaleDateString('zh-CN', dateOptions);
    
    // 格式化时间：14:30:45
    currentTimeEl.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
}

// 从文件加载数据
function loadDataFromFile(fileName) {
    return fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error('文件不存在');
            }
            return response.text();
        })
        .catch(error => {
            console.log(`无法加载文件 ${fileName}: ${error.message}`);
            return '';
        });
}

// 加载每日寄语从文件
function loadMessageFromFile() {
    loadDataFromFile(FILE_NAMES.MESSAGE)
        .then(data => {
            if (data) {
                messageContentEl.textContent = data.trim();
            } else {
                messageContentEl.textContent = "每一天都是新的开始，给自己一个微笑！";
            }
        });
}

// 加载生日数据从文件
function loadBirthdaysFromFile() {
    loadDataFromFile(FILE_NAMES.BIRTHDAYS)
        .then(data => {
            if (data) {
                const birthdays = parseBirthdayFile(data);
                displayBirthdays(birthdays);
            } else {
                birthdayListEl.innerHTML = '<p class="no-data">暂无生日数据</p>';
            }
        });
}

// 加载日程安排从文件
function loadSchedulesFromFile() {
    loadDataFromFile(FILE_NAMES.SCHEDULES)
        .then(data => {
            if (data) {
                const schedules = parseScheduleFile(data);
                displaySchedules(schedules);
            } else {
                scheduleListEl.innerHTML = '<p class="no-data">暂无日程安排</p>';
            }
        });
}

// 解析生日文件内容
function parseBirthdayFile(content) {
    const lines = content.trim().split('\n');
    const birthdays = [];
    
    lines.forEach(line => {
        if (line.trim()) {
            const name = line.split(' ')[0];
            const type = line.split(' ')[1]; // "农历" 或 "阳历"
            const dateStr = line.split(' ')[2];
            
            let date = null;
            
            if (type === "农历") {
                // 农历日期，转换为今年对应的阳历日期
                date = LunarCalendar.calculateLunarBirthday(line);
            } else {
                // 阳历日期，直接解析
                date = LunarCalendar.parseSolarBirthday(line);
            }
            
            if (date) {
                birthdays.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: name,
                    date: date.toISOString().split('T')[0],
                    lunarType: type === "农历",
                    originalStr: line
                });
            }
        }
    });
    
    return birthdays;
}

// 解析日程文件内容
function parseScheduleFile(content) {
    const lines = content.trim().split('\n');
    const schedules = [];
    
    lines.forEach(line => {
        // 预期格式: 2023-05-17 10:00 事件内容 [完成状态]
        const parts = line.split(' ');
        if (parts.length >= 3) {
            let dateStr = parts[0];
            let timeStr = parts[1];
            // 检查第二部分是否为时间格式
            if (timeStr.includes(':')) {
                // 有时间部分
                const date = dateStr + 'T' + timeStr;
                
                // 检查最后一项是否为完成状态标记
                let isCompleted = false;
                let text = '';
                
                if (parts[parts.length - 1] === '[已完成]') {
                    isCompleted = true;
                    text = parts.slice(2, parts.length - 1).join(' ');
                } else {
                    text = parts.slice(2).join(' ');
                }
                
                schedules.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    date: date,
                    text: text,
                    completed: isCompleted
                });
            }
        }
    });
    
    return schedules;
}

// 显示生日列表
function displayBirthdays(birthdays) {
    if (birthdays.length === 0) {
        birthdayListEl.innerHTML = '<p class="no-data">暂无近期生日</p>';
        return;
    }
    
    // 清空列表
    birthdayListEl.innerHTML = '';
    
    // 对生日按照日期远近排序
    const sortedBirthdays = sortBirthdaysByUpcoming(birthdays);
    
    // 显示生日列表
    sortedBirthdays.forEach(birthday => {
        const daysUntil = getDaysUntilBirthday(birthday.date);
        const birthdayItem = document.createElement('div');
        birthdayItem.className = 'birthday-item';
        
        // 特殊标记今天生日的人
        if (daysUntil === 0) {
            birthdayItem.style.background = 'rgba(255, 188, 73, 0.3)';
        }
        
        let typeLabel = birthday.lunarType ? '<span class="lunar-label">农历</span>' : '';
        
        birthdayItem.innerHTML = `
            <div>
                <div class="birthday-name">${birthday.name} ${typeLabel}</div>
                <div class="birthday-date">${formatBirthdayDate(birthday.date)}</div>
            </div>
            <div class="birthday-days">${daysUntil === 0 ? '今天' : `${daysUntil}天后`}</div>
        `;
        
        birthdayListEl.appendChild(birthdayItem);
    });
}

// 显示日程列表
function displaySchedules(schedules) {
    // 清空列表
    scheduleListEl.innerHTML = '';
    
    if (schedules.length === 0) {
        scheduleListEl.innerHTML = '<p class="no-data">暂无日程安排</p>';
        return;
    }
    
    // 按日期排序日程
    const sortedSchedules = sortSchedulesByDate(schedules);
    
    // 获取今天的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 划分历史和未来日程
    const upcomingSchedules = [];
    const pastSchedules = [];
    
    sortedSchedules.forEach((schedule) => {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        
        if (scheduleDate >= today) {
            upcomingSchedules.push(schedule);
        } else {
            pastSchedules.push(schedule);
        }
    });
    
    // 创建隐藏的历史日程容器
    if (pastSchedules.length > 0) {
        const pastContainer = document.createElement('div');
        pastContainer.className = 'past-schedules-container';
        
        pastSchedules.forEach(schedule => {
            appendScheduleItem(schedule, pastContainer, false);
        });
        
        scheduleListEl.appendChild(pastContainer);
    }
    
    // 添加即将到来的日程
    if (upcomingSchedules.length > 0) {
        upcomingSchedules.forEach((schedule, index) => {
            // 第一条即将到来的日程添加箭头标记
            const isFirst = index === 0;
            appendScheduleItem(schedule, scheduleListEl, isFirst);
        });
        
        // 确保第一条即将到来的日程可见
        if (scheduleListEl.firstChild) {
            setTimeout(() => {
                scheduleListEl.scrollTop = 0;
            }, 100);
        }
    }
    
    function appendScheduleItem(schedule, container, isFirstUpcoming) {
        const scheduleDate = new Date(schedule.date);
        const isToday = scheduleDate.toDateString() === today.toDateString();
        
        const scheduleItem = document.createElement('div');
        
        // 添加不同的样式
        let itemClass = 'schedule-item';
        if (schedule.completed) itemClass += ' completed';
        if (scheduleDate < today && !schedule.completed) itemClass += ' past';
        if (isToday) itemClass += ' today';
        if (isFirstUpcoming) itemClass += ' first-upcoming';
        
        scheduleItem.className = itemClass;
        
        // 添加箭头标记给第一条即将到来的日程
        const arrowMark = isFirstUpcoming ? '<span class="arrow-mark">&gt;</span>' : '';
        
        scheduleItem.innerHTML = `
            <div>
                ${arrowMark}
                <div class="schedule-text">${schedule.text}</div>
                <div class="schedule-date">${formatScheduleDate(schedule.date)}</div>
            </div>
        `;
        
        container.appendChild(scheduleItem);
    }
}

// 按日期排序日程
function sortSchedulesByDate(schedules) {
    return [...schedules].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
}

// 计算距离生日还有多少天
function getDaysUntilBirthday(birthdateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 解析生日日期
    const birthdate = new Date(birthdateStr);
    
    // 创建今年的生日日期
    const birthdayThisYear = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
    
    // 如果今年的生日已经过了，计算到明年生日的天数
    if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }
    
    // 计算天数差异
    const diffTime = birthdayThisYear - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// 格式化生日日期
function formatBirthdayDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 日程日期格式化
function formatScheduleDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 格式化时间
    const timeStr = date.toTimeString().substring(0, 5);
    
    if (isSameDay(date, today)) {
        return `今天 ${timeStr}`;
    } else if (isSameDay(date, tomorrow)) {
        return `明天 ${timeStr}`;
    } else {
        return `${date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })} ${timeStr}`;
    }
}

// 判断两个日期是否是同一天
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// 按即将到来的日期排序生日
function sortBirthdaysByUpcoming(birthdays) {
    // 复制数组以避免修改原数组
    const birthdayCopy = [...birthdays];
    
    // 按照还有多少天过生日排序
    return birthdayCopy.sort((a, b) => {
        return getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date);
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init); 