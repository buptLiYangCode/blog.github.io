// DOM元素
const currentDateEl = document.getElementById('current-date');
const currentTimeEl = document.getElementById('current-time');
const birthdayListEl = document.getElementById('birthday-list');
const scheduleListEl = document.getElementById('schedule-list');
const messageContentEl = document.getElementById('message-content');
const saveMessageBtn = document.getElementById('save-message-btn');
const addBirthdayBtn = document.getElementById('add-birthday-btn');
const addScheduleBtn = document.getElementById('add-schedule-btn');
const newScheduleInput = document.getElementById('new-schedule');
const birthdayModal = document.getElementById('birthday-modal');
const birthdayForm = document.getElementById('birthday-form');
const closeModalBtn = document.querySelector('.close-btn');
const wallpaperUpload = document.getElementById('wallpaper-upload');

// 存储键名
const STORAGE_KEYS = {
    BIRTHDAYS: 'personal_dashboard_birthdays',
    SCHEDULES: 'personal_dashboard_schedules',
    MESSAGE: 'personal_dashboard_message',
    WALLPAPER: 'personal_dashboard_wallpaper'
};

// 初始化
function init() {
    updateDateTime();
    loadWallpaper();
    loadMessage();
    loadBirthdays();
    loadSchedules();
    
    // 设置定时器每秒更新时间
    setInterval(updateDateTime, 1000);
    
    // 绑定事件
    addEventListeners();
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

// 加载背景壁纸
function loadWallpaper() {
    const savedWallpaper = localStorage.getItem(STORAGE_KEYS.WALLPAPER);
    if (savedWallpaper) {
        document.body.style.backgroundImage = `url(${savedWallpaper})`;
    }
}

// 加载每日寄语
function loadMessage() {
    const savedMessage = localStorage.getItem(STORAGE_KEYS.MESSAGE);
    if (savedMessage) {
        messageContentEl.textContent = savedMessage;
    }
}

// 加载生日数据
function loadBirthdays() {
    const savedBirthdays = JSON.parse(localStorage.getItem(STORAGE_KEYS.BIRTHDAYS) || '[]');
    
    if (savedBirthdays.length === 0) {
        birthdayListEl.innerHTML = '<p class="no-data">暂无近期生日</p>';
        return;
    }
    
    // 清空列表
    birthdayListEl.innerHTML = '';
    
    // 对生日按照日期远近排序
    const sortedBirthdays = sortBirthdaysByUpcoming(savedBirthdays);
    
    // 显示生日列表
    sortedBirthdays.forEach(birthday => {
        const daysUntil = getDaysUntilBirthday(birthday.date);
        const birthdayItem = document.createElement('div');
        birthdayItem.className = 'birthday-item';
        
        // 特殊标记今天生日的人
        if (daysUntil === 0) {
            birthdayItem.style.background = 'rgba(255, 188, 73, 0.3)';
        }
        
        birthdayItem.innerHTML = `
            <div>
                <div class="birthday-name">${birthday.name}</div>
                <div class="birthday-date">${formatBirthdayDate(birthday.date)}</div>
            </div>
            <div class="birthday-days">${daysUntil === 0 ? '今天' : `${daysUntil}天后`}</div>
            <button class="control-btn delete-btn" data-id="${birthday.id}">×</button>
        `;
        
        birthdayListEl.appendChild(birthdayItem);
    });
    
    // 绑定删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteBirthday(id);
        });
    });
}

// 加载日程安排
function loadSchedules() {
    const savedSchedules = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '[]');
    
    // 清空列表
    scheduleListEl.innerHTML = '';
    
    if (savedSchedules.length === 0) {
        scheduleListEl.innerHTML = '<p class="no-data">今日暂无日程安排</p>';
        return;
    }
    
    // 显示日程列表
    savedSchedules.forEach(schedule => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = `schedule-item ${schedule.completed ? 'completed' : ''}`;
        scheduleItem.innerHTML = `
            <div class="schedule-text">${schedule.text}</div>
            <div>
                <button class="control-btn toggle-btn" data-id="${schedule.id}">${schedule.completed ? '↩' : '✓'}</button>
                <button class="control-btn delete-schedule-btn" data-id="${schedule.id}">×</button>
            </div>
        `;
        
        scheduleListEl.appendChild(scheduleItem);
    });
    
    // 绑定按钮事件
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            toggleScheduleStatus(id);
        });
    });
    
    document.querySelectorAll('.delete-schedule-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteSchedule(id);
        });
    });
}

// 保存每日寄语
function saveMessage() {
    const message = messageContentEl.textContent.trim();
    localStorage.setItem(STORAGE_KEYS.MESSAGE, message);
    showNotification('寄语已保存');
}

// 添加生日
function addBirthday(name, date) {
    const birthdays = JSON.parse(localStorage.getItem(STORAGE_KEYS.BIRTHDAYS) || '[]');
    
    // 创建新生日条目
    const newBirthday = {
        id: Date.now().toString(),
        name: name,
        date: date
    };
    
    birthdays.push(newBirthday);
    localStorage.setItem(STORAGE_KEYS.BIRTHDAYS, JSON.stringify(birthdays));
    
    // 重新加载生日列表
    loadBirthdays();
    showNotification('生日已添加');
}

// 删除生日
function deleteBirthday(id) {
    const birthdays = JSON.parse(localStorage.getItem(STORAGE_KEYS.BIRTHDAYS) || '[]');
    const filteredBirthdays = birthdays.filter(birthday => birthday.id !== id);
    
    localStorage.setItem(STORAGE_KEYS.BIRTHDAYS, JSON.stringify(filteredBirthdays));
    
    // 重新加载生日列表
    loadBirthdays();
    showNotification('生日已删除');
}

// 添加日程
function addSchedule(text) {
    if (!text.trim()) return;
    
    const schedules = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '[]');
    
    // 创建新日程
    const newSchedule = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false
    };
    
    schedules.push(newSchedule);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    
    // 重新加载日程列表
    loadSchedules();
    
    // 清空输入框
    newScheduleInput.value = '';
    showNotification('日程已添加');
}

// 删除日程
function deleteSchedule(id) {
    const schedules = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '[]');
    const filteredSchedules = schedules.filter(schedule => schedule.id !== id);
    
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(filteredSchedules));
    
    // 重新加载日程列表
    loadSchedules();
    showNotification('日程已删除');
}

// 切换日程状态
function toggleScheduleStatus(id) {
    const schedules = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '[]');
    
    // 查找并更改状态
    const updatedSchedules = schedules.map(schedule => {
        if (schedule.id === id) {
            return { ...schedule, completed: !schedule.completed };
        }
        return schedule;
    });
    
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updatedSchedules));
    
    // 重新加载日程列表
    loadSchedules();
}

// 上传壁纸
function handleWallpaperUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        
        // 保存壁纸到本地存储
        localStorage.setItem(STORAGE_KEYS.WALLPAPER, dataUrl);
        
        // 设置背景
        document.body.style.backgroundImage = `url(${dataUrl})`;
        
        showNotification('壁纸已更新');
    };
    
    reader.readAsDataURL(file);
}

// 计算距离生日还有多少天
function getDaysUntilBirthday(birthdateStr) {
    const today = new Date();
    const birthdate = new Date(birthdateStr);
    
    // 设置生日为今年
    const thisYearBirthday = new Date(
        today.getFullYear(),
        birthdate.getMonth(),
        birthdate.getDate()
    );
    
    // 如果今年的生日已经过了，计算到明年生日的天数
    if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    // 计算天数差
    const diffTime = thisYearBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// 格式化生日日期为 "MM月DD日" 格式
function formatBirthdayDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // 样式
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.background = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 按照即将到来的生日排序
function sortBirthdaysByUpcoming(birthdays) {
    return [...birthdays].sort((a, b) => {
        const daysA = getDaysUntilBirthday(a.date);
        const daysB = getDaysUntilBirthday(b.date);
        return daysA - daysB;
    });
}

// 打开生日模态框
function openBirthdayModal() {
    birthdayModal.classList.add('show');
}

// 关闭生日模态框
function closeBirthdayModal() {
    birthdayModal.classList.remove('show');
}

// 绑定事件监听
function addEventListeners() {
    // 保存寄语
    saveMessageBtn.addEventListener('click', saveMessage);
    
    // 日程添加
    addScheduleBtn.addEventListener('click', () => {
        addSchedule(newScheduleInput.value);
    });
    
    // 按回车添加日程
    newScheduleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSchedule(newScheduleInput.value);
        }
    });
    
    // 生日模态框
    addBirthdayBtn.addEventListener('click', openBirthdayModal);
    closeModalBtn.addEventListener('click', closeBirthdayModal);
    
    // 点击模态框外部关闭
    birthdayModal.addEventListener('click', (e) => {
        if (e.target === birthdayModal) {
            closeBirthdayModal();
        }
    });
    
    // 提交生日表单
    birthdayForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('person-name').value.trim();
        const date = document.getElementById('birth-date').value;
        
        if (name && date) {
            addBirthday(name, date);
            birthdayForm.reset();
            closeBirthdayModal();
        }
    });
    
    // 壁纸上传
    wallpaperUpload.addEventListener('change', handleWallpaperUpload);
}

// 应用启动
document.addEventListener('DOMContentLoaded', init); 