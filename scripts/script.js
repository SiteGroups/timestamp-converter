// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 显示全球主要城市当前时间
    updateWorldTime();
    setInterval(updateWorldTime, 1000);

    function updateWorldTime() {
        const now = new Date();
        const cities = [
            { id: 'beijing', timeZone: 'Asia/Shanghai', lang: document.documentElement.lang },
            { id: 'newyork', timeZone: 'America/New_York', lang: document.documentElement.lang },
            { id: 'london', timeZone: 'Europe/London', lang: document.documentElement.lang },
            { id: 'tokyo', timeZone: 'Asia/Tokyo', lang: document.documentElement.lang }
        ];

        cities.forEach(city => {
            const timeElement = document.getElementById(`${city.id}-time`);
            const dateElement = document.getElementById(`${city.id}-date`);

            if (timeElement && dateElement) {
                const time = new Intl.DateTimeFormat(city.lang, {
                    timeZone: city.timeZone,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).format(now);

                const date = new Intl.DateTimeFormat(city.lang, {
                    timeZone: city.timeZone,
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short'
                }).format(now);

                timeElement.textContent = time;
                dateElement.textContent = date;
            }
        });
    }
    const convertBtn = document.getElementById('convertBtn');
    const inputType = document.getElementById('inputType');
    const inputValue = document.getElementById('inputValue');
    const timezone = document.getElementById('timezone');
    const resultValue = document.getElementById('resultValue');
    const additionalInfo = document.getElementById('additionalInfo');
    
    // 确保按钮元素存在
    if (!convertBtn) {
        console.error('转换按钮元素未找到');
        return;
    }
    
    // 添加点击事件监听
    convertBtn.addEventListener('click', function() {
        try {
            const value = inputValue.value.trim();
            if (!value) {
                alert('请输入需要转换的值');
                return;
            }
            
            let result;
            if (inputType.value === 'timestamp') {
                // 时间戳转日期时间
                result = convertTimestampToDatetime(value, timezone.value);
                additionalInfo.innerHTML = generateAdditionalInfo(value, timezone.value);
            } else {
                // 日期时间转时间戳
                result = convertDatetimeToTimestamp(value, timezone.value);
                additionalInfo.innerHTML = generateAdditionalInfo(result, timezone.value);
            }
            
            resultValue.value = result;
        } catch (error) {
            console.error('转换错误:', error);
            alert('转换失败: ' + error.message);
        }
    });
    
    // 时间戳转日期时间
    function convertTimestampToDatetime(timestamp, tz) {
        // 处理毫秒级时间戳
        let ts = Number(timestamp);
        if (ts.toString().length === 13) {
            ts = ts / 1000;
        }
        
        const date = new Date(ts * 1000);
        let timeZone;
        
        // 根据时区设置
        switch(tz) {
            case 'beijing':
                timeZone = 'Asia/Shanghai';
                break;
            case 'est':
                timeZone = 'America/New_York';
                break;
            case 'pst':
                timeZone = 'America/Los_Angeles';
                break;
            default:
                timeZone = 'UTC';
        }
        
        return new Intl.DateTimeFormat(document.documentElement.lang, {
            timeZone: timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }
    
    // 日期时间转时间戳
    function convertDatetimeToTimestamp(datetime, tz) {
        const formats = [
            'YYYY-MM-DD HH:mm:ss',
            'YYYY/MM/DD HH:mm:ss',
            'YYYY-MM-DD',
            'YYYY/MM/DD'
        ];
        
        let date;
        // 尝试解析不同格式
        for (const format of formats) {
            date = parseDate(datetime, format);
            if (date) break;
        }
        
        if (!date) {
            throw new Error('日期时间格式不正确，请使用YYYY-MM-DD HH:mm:ss格式');
        }
        
        // 根据时区调整
        let offset = 0;
        switch(tz) {
            case 'beijing':
                offset = 8 * 3600 * 1000; // UTC+8
                break;
            case 'est':
                offset = -5 * 3600 * 1000; // UTC-5
                break;
            case 'pst':
                offset = -8 * 3600 * 1000; // UTC-8
                break;
        }
        
        return Math.floor((date.getTime() + offset) / 1000);
    }
    
    // 日期解析辅助函数
    function parseDate(dateStr, format) {
        try {
            const parts = dateStr.split(/[-/ :]/).map(Number);
            if (format.includes('YYYY-MM-DD HH:mm:ss') && parts.length === 6) {
                return new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
            } else if (format.includes('YYYY-MM-DD') && parts.length === 3) {
                return new Date(parts[0], parts[1]-1, parts[2]);
            }
            return null;
        } catch (e) {
            return null;
        }
    }
    
    // 生成附加信息
    function generateAdditionalInfo(timestamp, tz) {
        let ts = Number(timestamp);
        let isMilliseconds = false;
        
        if (ts.toString().length === 13) {
            ts = ts / 1000;
            isMilliseconds = true;
        }
        
        const date = new Date(ts * 1000);
        let timeZone;
        
        switch(tz) {
            case 'beijing':
                timeZone = 'Asia/Shanghai';
                break;
            case 'est':
                timeZone = 'America/New_York';
                break;
            case 'pst':
                timeZone = 'America/Los_Angeles';
                break;
            default:
                timeZone = 'UTC';
        }
        
        const weekday = new Intl.DateTimeFormat(document.documentElement.lang, { 
            timeZone: timeZone,
            weekday: 'long'
        }).format(date);
        
        const fullDate = new Intl.DateTimeFormat(document.documentElement.lang, { 
            timeZone: timeZone,
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
        
        // 语言文本映射
        const i18n = {
            'zh-CN': {
                weekday: '星期：',
                fullDate: '完整日期：',
                timestampUnit: '时间戳单位：',
                milliseconds: '毫秒',
                seconds: '秒'
            },
            'en': {
                weekday: 'Weekday: ',
                fullDate: 'Full Date: ',
                timestampUnit: 'Timestamp Unit: ',
                milliseconds: 'milliseconds',
                seconds: 'seconds'
            }
        };

        // 获取当前页面语言
        const lang = document.documentElement.lang;
        const texts = i18n[lang] || i18n['en'];

        let info = `
            <div class="mb-2"><strong>${texts.weekday}</strong>${weekday}</div>
            <div class="mb-2"><strong>${texts.fullDate}</strong>${fullDate}</div>
            <div><strong>${texts.timestampUnit}</strong>${isMilliseconds ? texts.milliseconds : texts.seconds}</div>
        `;
        
        return info;
    }
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
});
