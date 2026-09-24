/**
 * VSTEP SPEAKING PART 01 - ACADEMIC SCRIPT
 * Handles slide navigation, interactive formula presentation, speech synthesis, and random practice.
 */

document.addEventListener('DOMContentLoaded', () => {
    try {
    // App State
    const state = {
        studentName: 'Khách',
        isAudio: true,
        isDark: false,
        ynIndex: 0,
        selectedVoiceURI: null,
        unlockedTabs: {}
    };

    // DOM References
    const welcomeModal = document.getElementById('welcome-modal');
    const studentInput = document.getElementById('student-name');
    const studentClassInput = document.getElementById('student-class');
    const loginError = document.getElementById('login-error');
    const trackingForm = document.getElementById('tracking-form');
    const entryInput = document.getElementById('entry_388968236');
    const startBtn = document.getElementById('start-btn');
    const userProfile = document.getElementById('user-profile');
    const displayName = document.getElementById('display-name');
    
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const topTitle = document.getElementById('top-title');
    const themeToggle = document.getElementById('theme-toggle');
    const audioToggle = document.getElementById('audio-toggle');
    const voiceSelect = document.getElementById('voice-select');

    // Tab Titles Mapping
    const titles = {
        'overview': 'OVERVIEW',
        'yes-no': 'YES/NO QUESTIONS',
        'choice': 'CHOICE QUESTIONS',
        'wh-questions': 'WH- QUESTIONS',
        'benefits': 'COMMON BENEFITS',
        'activities': 'COMMON ACTIVITIES',
        'topics': 'TỪ VỰNG THEO CHỦ ĐỀ',
        'practice-topics': 'LUYỆN TẬP THEO CHỦ ĐỀ'
    };

    // Thuật toán tìm giọng đọc AI tự nhiên nhất (High Quality / Neural / Natural / Siri)
    const getBestNaturalVoice = (voices) => {
        if (!voices || voices.length === 0) return null;
        const enVoices = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().startsWith('us')));
        if (enVoices.length === 0) return null;

        // 1. Ưu tiên cao nhất: Các giọng Neural / Natural / Premium / Enhanced / Siri (Chất lượng phòng thu / người thật)
        const premiumKeywords = ['natural', 'premium', 'enhanced', 'neural', 'siri'];
        for (const kw of premiumKeywords) {
            const match = enVoices.find(v => (v.name && v.name.toLowerCase().includes(kw)) || (v.voiceURI && v.voiceURI.toLowerCase().includes(kw)));
            if (match) return match;
        }

        // 2. Trên iOS (iPhone/iPad): Ưu tiên các giọng hiện đại chất lượng cao của Apple
        const appleModernNames = ['ava', 'evan', 'allison', 'zoe', 'nathan', 'oliver', 'tom', 'nicky', 'daniel', 'serena'];
        for (const name of appleModernNames) {
            const match = enVoices.find(v => v.name && v.name.toLowerCase().includes(name));
            if (match) return match;
        }

        // 3. Trên PC (Microsoft Edge, Windows, Chrome Desktop)
        const pcModernNames = ['guy', 'jenny', 'aria', 'google us english', 'google uk english female'];
        for (const name of pcModernNames) {
            const match = enVoices.find(v => v.name && v.name.toLowerCase().includes(name));
            if (match) return match;
        }

        // 4. Trên Android (Google Speech Services): Ưu tiên giọng network (WaveNet)
        const networkVoice = enVoices.find(v => (v.voiceURI && v.voiceURI.includes('network')) || (v.name && v.name.toLowerCase().includes('network')));
        if (networkVoice) return networkVoice;

        // 5. Lọc bỏ các giọng tổng hợp máy móc cổ điển (Alex, Samantha standard) nếu có giọng khác
        const nonRobotic = enVoices.filter(v => {
            const n = (v.name || '').toLowerCase();
            return !n.includes('alex') && !n.includes('samantha') && !n.includes('fred') && !n.includes('victoria');
        });
        if (nonRobotic.length > 0) {
            return nonRobotic.find(v => v.lang.includes('US') || v.lang.includes('en-US')) || nonRobotic[0];
        }

        return enVoices[0];
    };

    // Quản lý danh sách giọng đọc AI
    const populateVoices = () => {
        if (!('speechSynthesis' in window)) return;
        const voices = window.speechSynthesis.getVoices() || [];
        const enVoices = voices.filter(v => v.lang && (v.lang.startsWith('en') || v.lang.startsWith('EN')));
        if (enVoices.length === 0) return;
        
        const defaultVoice = getBestNaturalVoice(voices);
        if (defaultVoice && !state.selectedVoiceURI) {
            state.selectedVoiceURI = defaultVoice.voiceURI;
        }

        if (voiceSelect) {
            const currentSelection = state.selectedVoiceURI || voiceSelect.value;
            voiceSelect.innerHTML = '';
            enVoices.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.voiceURI;
                opt.textContent = `${v.name.replace('Microsoft ', '').replace('Online (Natural) - English (United States)', 'US').replace(' - English (United States)', ' US')} (${v.lang})`;
                voiceSelect.appendChild(opt);
            });

            if (currentSelection && voices.some(v => v.voiceURI === currentSelection)) {
                voiceSelect.value = currentSelection;
            } else if (defaultVoice) {
                voiceSelect.value = defaultVoice.voiceURI;
            }
        }
    };

    if (voiceSelect) {
        voiceSelect.addEventListener('change', (e) => {
            state.selectedVoiceURI = e.target.value;
            window.speakText("Hello! I am your AI speaking partner.");
        });
    }

    if ('speechSynthesis' in window) {
        populateVoices();
        window.speechSynthesis.onvoiceschanged = () => populateVoices();
        window.addEventListener('touchstart', () => {
            if (window.speechSynthesis && (!window.speechSynthesis.getVoices() || window.speechSynthesis.getVoices().length === 0)) {
                window.speechSynthesis.getVoices();
                populateVoices();
            }
        }, { once: true });
    }

    // Studio Audio Manifest (Real Human Studio Recordings)
    let studioAudioManifest = window.studioAudioManifest || {};
    if (!window.studioAudioManifest) {
        fetch('audio/manifest.json')
            .then(r => r.json())
            .then(data => {
                studioAudioManifest = data;
                window.studioAudioManifest = data;
            })
            .catch(() => {});
    }

    // Classic Computer Browser Speech (Original Pitch 1.25, Rate 1.0, Energetic & Smooth)
    window._activeUtterance = null;
    const speakClassicTTS = (cleanTxt) => {
        if (!('speechSynthesis' in window)) return;
        try {
            if (window._currentAudio) {
                window._currentAudio.pause();
                window._currentAudio.currentTime = 0;
            }
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
            window.speechSynthesis.cancel();
            
            const utt = new SpeechSynthesisUtterance(cleanTxt);
            window._activeUtterance = utt;
            const voices = window.speechSynthesis.getVoices() || [];
            
            let bestVoice = null;
            if (state.selectedVoiceURI) {
                bestVoice = voices.find(v => v.voiceURI === state.selectedVoiceURI);
            }
            if (!bestVoice) {
                const preferredNames = [
                    "Microsoft Guy",
                    "Google UK English Male",
                    "Google US English Male",
                    "Alex",
                    "Daniel",
                    "Google US English",
                    "Samantha"
                ];
                for (let name of preferredNames) {
                    bestVoice = voices.find(v => v.name && v.name.includes(name));
                    if (bestVoice) break;
                }
                if (!bestVoice) {
                    bestVoice = voices.find(v => v.lang && (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")) && v.name && v.name.includes("Male"));
                }
                if (!bestVoice) {
                    bestVoice = voices.find(v => v.lang && (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")));
                }
                if (!bestVoice) {
                    bestVoice = voices[0];
                }
            }
            
            if (bestVoice) {
                utt.voice = bestVoice;
                utt.lang = bestVoice.lang;
            } else {
                utt.lang = 'en-US';
            }
            utt.rate = 1.0; // Tốc độ chuẩn ban đầu
            utt.pitch = 1.25; // Cao độ sáng, trẻ trung, năng động gốc trên máy tính
            
            utt.onend = () => { window._activeUtterance = null; };
            utt.onerror = () => { window._activeUtterance = null; };

            setTimeout(() => {
                window.speechSynthesis.speak(utt);
                if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            }, 10);
        } catch (e) {
            console.error("Error in classic TTS:", e);
        }
    };

    // Global AI Speech - Hỗ trợ cả 2 chế độ (Giọng Gốc Máy Tính & Giọng Phòng Thu Studio)
    window._currentAudio = null;
    window.speakText = (txt, forcedMode) => {
        if (!state.isAudio) return;

        const mode = forcedMode || state.voiceMode;
        let cleanTxt = (txt || '').replace(/<[^>]*>/g, '').replace(/^→\s*/, '').replace(/[\r\n]+/g, ' ').trim();
        if (!cleanTxt) return;

        if (mode === 'studio') {
            const manifest = window.studioAudioManifest || studioAudioManifest || {};
            const audioPath = manifest[cleanTxt] || manifest[cleanTxt.toLowerCase()];
            if (audioPath) {
                try {
                    if (window._currentAudio) {
                        window._currentAudio.pause();
                        window._currentAudio.currentTime = 0;
                    }
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                    }
                    const audio = new Audio(audioPath);
                    window._currentAudio = audio;
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            console.warn("Studio audio play blocked, fallback to classic:", err);
                            speakClassicTTS(cleanTxt);
                        });
                    }
                    return;
                } catch (e) {
                    console.warn("Audio tag error:", e);
                }
            }
        }

        // Chế độ 'classic' (Mặc định) hoặc fallback
        speakClassicTTS(cleanTxt);
    };

    // Hàm Nghe Thử & Chọn Chế Độ Giọng
    window.previewVoice = (mode) => {
        const sampleSentence = "Sure. I often play sports in the afternoon whenever I have free time. It allows me to relax after a busy day and stay healthy.";
        window.speakText(sampleSentence, mode);
    };

    window.setVoiceMode = (mode) => {
        state.voiceMode = mode;
        localStorage.setItem('vstep_voice_mode', mode);
        updateVoiceUI();
        window.previewVoice(mode);
    };

    const voiceModeToggle = document.getElementById('voice-mode-toggle');
    const voiceModeLabel = document.getElementById('voice-mode-label');
    const currentVoiceBadge = document.getElementById('current-voice-badge');

    const updateVoiceUI = () => {
        const mode = state.voiceMode;
        if (voiceModeLabel) {
            voiceModeLabel.textContent = mode === 'studio' ? 'Giọng Studio' : 'Giọng Gốc';
        }
        if (currentVoiceBadge) {
            currentVoiceBadge.textContent = mode === 'studio' ? 'Đang dùng: Giọng Phòng Thu Studio' : 'Đang dùng: Giọng Gốc Máy Tính';
            currentVoiceBadge.style.background = mode === 'studio' ? '#8b5cf6' : '#4361ee';
        }
    };

    if (voiceModeToggle) {
        voiceModeToggle.addEventListener('click', () => {
            const nextMode = state.voiceMode === 'studio' ? 'classic' : 'studio';
            window.setVoiceMode(nextMode);
        });
    }
    updateVoiceUI();

    // 1. WELCOME MODAL & STUDENT AUTHENTICATION
    const validStudentsB212 = [
        "Nguyễn Duy Hồng Anh",
        "Nguyễn Ngọc Minh Anh",
        "Nguyễn Lê Mỹ Hân",
        "Nguyễn Hồng Minh Huy",
        "Nguyễn Quốc Khải",
        "Đoàn Nguyễn Đình Khang",
        "Lê Nguyễn Gia Khánh",
        "Nguyễn Hữu Khánh",
        "Hồ Thị Ngọc Lan",
        "Trần Thị Hồng Lỉnh",
        "Võ Thị Triệu Minh",
        "Hứa Đình Nghi",
        "Võ Thị Bảo Ngọc",
        "Lê Tiến Phát",
        "Nguyễn Hoàng Thông",
        "Nguyễn Kim Tiền",
        "Lê Thị Bảo Trân",
        "Võ Thị Diễm Trinh",
        "Nguyễn Tiến Trung",
        "Trần Thị Ánh Tuyết",
        "Đặng Nguyễn Khánh Uyên",
        "Nguyễn Thị Chúc Yến"
    ];

    const normalizeStr = (str) => {
        return (str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    };

    window.finishLogin = () => {
        const val = state.studentName || studentInput.value.trim();
        displayName.textContent = val;
        userProfile.classList.remove('hidden');
        welcomeModal.style.opacity = '0';
        setTimeout(() => welcomeModal.classList.add('hidden'), 300);
    };

    const enterRoom = () => {
        const nameVal = studentInput.value.trim();
        const classVal = studentClassInput.value.trim();
        
        if (!nameVal || !classVal) {
            loginError.textContent = 'Vui lòng nhập đầy đủ Họ tên và Lớp!';
            loginError.style.display = 'block';
            return;
        }

        const formattedClass = classVal.toUpperCase().replace(/\s+/g, '');
        const normName = normalizeStr(nameVal);

        // Check Teacher access
        const isTeacher = (formattedClass === 'GV' || formattedClass === 'GV2026') && 
                          (normName === 'ptmn' || normName === 'pham thi minh nguyet' || normName === 'minh nguyet');

        if (isTeacher) {
            state.studentName = 'Cô Nguyệt';
            state.accessLevel = 'FULL';
        } else if (formattedClass === 'B212') {
            // Check student list for class B212
            const matchedStudent = validStudentsB212.find(s => {
                return normalizeStr(s) === normName;
            });

            if (!matchedStudent) {
                loginError.textContent = 'Họ và Tên không thuộc danh sách lớp B212. Vui lòng kiểm tra lại!';
                loginError.style.display = 'block';
                return;
            }
            state.studentName = matchedStudent;
            state.accessLevel = 'FULL';
        } else {
            loginError.textContent = 'Mã lớp không hợp lệ. Vui lòng nhập đúng lớp B212!';
            loginError.style.display = 'block';
            return;
        }

        loginError.style.display = 'none';
        startBtn.disabled = true;
        startBtn.innerHTML = `<span>Đang vào lớp...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
        
        entryInput.value = `${nameVal} - ${classVal}`;
        window.submitted = true;
        trackingForm.submit();
        
        // Fallback timeout in case iframe block prevents onload
        setTimeout(() => {
            if (!welcomeModal.classList.contains('hidden')) {
                window.finishLogin();
            }
        }, 1500);
    };

    startBtn?.addEventListener('click', enterRoom);
    studentInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') enterRoom(); });
    studentClassInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') enterRoom(); });

    // Sidebar & Navigation
    mobileToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });

    // Tap outside sidebar to close on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !mobileToggle?.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    let currentTargetTab = null;
    let currentTargetItem = null;

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            


            activateTab(target, item);
        });
    });

    function activateTab(target, item) {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        tabPanes.forEach(pane => {
            if (pane.id === target) {
                pane.classList.remove('hidden');
                pane.classList.remove('fade-in');
                void pane.offsetWidth;
                pane.classList.add('fade-in');
            } else {
                pane.classList.add('hidden');
            }
        });

        if (topTitle) topTitle.textContent = titles[target] || target.toUpperCase();
        if (target === 'topics') {
            const activeBtn = document.querySelector('.sub-tab-btn.active') || document.querySelector('.sub-tab-btn');
            if (activeBtn) {
                const match = activeBtn.getAttribute('onclick')?.match(/switchSubTab\('([^']+)'/);
                const subId = match ? match[1] : 'books';
                window.switchSubTab(subId, activeBtn);
            }
        }
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.switchTab = (tabId) => {
        const item = document.querySelector(`.nav-item[data-target="${tabId}"]`);
        if (item) {
            activateTab(tabId, item);
        }
    };


    // Theme & Audio toggles
    themeToggle?.addEventListener('click', () => {
        state.isDark = !state.isDark;
        document.body.classList.toggle('dark-theme', state.isDark);
        themeToggle.innerHTML = state.isDark ? '<i class="fa-solid fa-sun" style="color:#f59e0b"></i>' : '<i class="fa-solid fa-moon"></i>';
    });

    audioToggle?.addEventListener('click', () => {
        state.isAudio = !state.isAudio;
        audioToggle.innerHTML = state.isAudio ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark" style="color:var(--danger)"></i>';
        audioToggle.classList.toggle('active', state.isAudio);
        if (!state.isAudio && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    });
    // 3. YES/NO PRACTICE ROOM SLIDER (7 Formulas)
    // 3. YES/NO PRACTICE ROOM SLIDER (7 Formulas from PowerPoint)
    window.toggleSampleAnswer = (btn) => {
        const ansEl = btn.nextElementSibling;
        if (ansEl.style.display === 'none') {
            ansEl.style.display = 'block';
            btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Ẩn câu trả lời mẫu';
        } else {
            ansEl.style.display = 'none';
            btn.innerHTML = '<i class="fa-solid fa-eye"></i> Nhấn xem câu trả lời mẫu';
        }
    };

        // 3. YES/NO PRACTICE ROOM SLIDER (7 Formulas from B2 PowerPoint)
        // 3. YES/NO PRACTICE ROOM SLIDER (7 Formulas with 6 Examples Each)
    const ynFormulas = [
        {
                "title": "1. Do you often [hoạt động – Vo]?",
                "formula": "→ Sure. I often <strong>[hoạt động – Vo]</strong> <strong>[thời gian]</strong> whenever I have free time. It allows me to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>.",
                "examples": [
                        {
                                "q": "Do you often <span class='sub-hl'>play sports</span>?",
                                "a": "→ Sure. I often play sports in the afternoon whenever I have free time. It allows me to relax after a busy day and stay healthy.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I often <strong>play sports</strong> <strong>in the afternoon</strong> whenever I have free time. It allows me to <strong>relax after a busy day</strong> and <strong>stay healthy</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>read books</span>?",
                                "a": "→ Sure. I often read books in the evening whenever I have free time. It allows me to widen my knowledge and develop my imagination.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I often <strong>read books</strong> <strong>in the evening</strong> whenever I have free time. It allows me to <strong>widen my knowledge</strong> and <strong>develop my imagination</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>listen to music</span>?",
                                "a": "→ Sure. I often listen to music before going to bed whenever I have free time. It allows me to relax after a busy day and sleep better.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I often <strong>listen to music</strong> <strong>before going to bed</strong> whenever I have free time. It allows me to <strong>relax after a busy day</strong> and <strong>sleep better</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>watch movies</span>?",
                                "a": "→ Sure. I often watch movies at weekends whenever I have free time. It allows me to enjoy my free time and improve my mood.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I often <strong>watch movies</strong> <strong>at weekends</strong> whenever I have free time. It allows me to <strong>enjoy my free time</strong> and <strong>improve my mood</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>go for a walk</span>?",
                                "a": "→ Sure. I often go for a walk in the early morning whenever I have free time. It allows me to stay in good shape and clear my mind.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I often <strong>go for a walk</strong> <strong>in the early morning</strong> whenever I have free time. It allows me to <strong>stay in good shape</strong> and <strong>clear my mind</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>go shopping</span>?",
                                "a": "→ Sure. I often go shopping at weekends whenever I have free time. It allows me to enjoy my free time and forget about my worries.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I often <strong>go shopping</strong> <strong>at weekends</strong> whenever I have free time. It allows me to <strong>enjoy my free time</strong> and <strong>forget about my worries</strong>.</div>"
                        }
                ],
                "exQ": "Do you often <span class='sub-hl'>play sports</span>?",
                "exA": "→ Sure. I often play sports in the afternoon whenever I have free time. It allows me to relax after a busy day and stay healthy.",
                "exAFormatted": "→ Sure. I often <span class=\"sub-hl\">play sports</span> <span class=\"sub-hl\">in the afternoon</span> whenever I have free time. It allows me to <span class=\"sub-hl\">relax after a busy day</span> and <span class=\"sub-hl\">stay healthy</span>.",
                "vocab": [
                        {
                                "type": "time",
                                "title": "Cụm Thời gian:",
                                "items": [
                                        {
                                                "en": "in the morning",
                                                "vn": "vào buổi sáng"
                                        },
                                        {
                                                "en": "in the afternoon",
                                                "vn": "vào buổi chiều"
                                        },
                                        {
                                                "en": "in the evening",
                                                "vn": "vào buổi tối"
                                        },
                                        {
                                                "en": "at night",
                                                "vn": "vào ban đêm"
                                        },
                                        {
                                                "en": "at weekends",
                                                "vn": "vào cuối tuần"
                                        },
                                        {
                                                "en": "on weekdays",
                                                "vn": "vào các ngày trong tuần"
                                        },
                                        {
                                                "en": "on my days off",
                                                "vn": "vào những ngày nghỉ"
                                        },
                                        {
                                                "en": "in my free time",
                                                "vn": "vào thời gian rảnh rỗi"
                                        },
                                        {
                                        "en": "after school",
                                        "vn": "sau giờ học"
                                },
                                {
                                        "en": "after work",
                                        "vn": "sau giờ làm"
                                }
                                ]
                        },
                        {
                                "type": "benefit",
                                "title": "Cụm Lợi ích:",
                                "items": [
                                        {
                                                "isNote": true,
                                                "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                        }
                                ]
                        }
                ]
        },
        {
                "title": "2. Do you often [hoạt động 1 – Vo] while [hoạt động 2 – Ving]?",
                "formula": "→ Not really. I don’t often <strong>[hoạt động 1 – Vo]</strong> while <strong>[hoạt động 2 – Ving]</strong> because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can <strong>[give it my full attention / complete it more effectively / do it more carefully]</strong>.",
                "examples": [
                        {
                                "q": "Do you often <span class='sub-hl'>listen to music</span> while <span class='sub-hl'>doing homework</span>?",
                                "a": "→ Not really. I don’t often listen to music while doing homework because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can complete it more effectively.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Not really. I don’t often <strong>listen to music</strong> while <strong>doing homework</strong> because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can <strong>complete it more effectively</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>listen to the radio</span> while <span class='sub-hl'>cooking</span>?",
                                "a": "→ Not really. I don’t often listen to the radio while cooking because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can do it more carefully.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Not really. I don’t often <strong>listen to the radio</strong> while <strong>cooking</strong> because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can <strong>do it more carefully</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>listen to podcasts</span> while <span class='sub-hl'>exercising</span>?",
                                "a": "→ Not really. I don’t often listen to podcasts while exercising because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can give it my full attention.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Not really. I don’t often <strong>listen to podcasts</strong> while <strong>exercising</strong> because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can <strong>give it my full attention</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>watch videos</span> while <span class='sub-hl'>eating</span>?",
                                "a": "→ Not really. I don’t often watch videos while eating because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can enjoy my food better.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Not really. I don’t often <strong>watch videos</strong> while <strong>eating</strong> because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can <strong>enjoy my food better</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>check social media</span> while <span class='sub-hl'>working</span>?",
                                "a": "→ Not really. I don’t often check social media while working because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can avoid careless mistakes.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Not really. I don’t often <strong>check social media</strong> while <strong>working</strong> because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can <strong>avoid careless mistakes</strong>.</div>"
                        },
                        {
                                "q": "Do you often <span class='sub-hl'>chat with friends</span> while <span class='sub-hl'>studying</span>?",
                                "a": "→ Not really. I don’t often chat with friends while studying because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can absorb information better.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Not really. I don’t often <strong>chat with friends</strong> while <strong>studying</strong> because I find it difficult to concentrate. Instead, I prefer to focus on one task at a time so that I can <strong>absorb information better</strong>.</div>"
                        }
                ],
                "exQ": "Do you often <span class='sub-hl'>listen to music</span> while <span class='sub-hl'>doing your homework</span>?",
                "exA": "→ Not really. I don’t often listen to music while doing my homework because it’s hard for me to focus. I prefer to do one thing at a time to do it better.",
                "exAFormatted": "→ Not really. I don’t often <span class=\"sub-hl\">listen to music</span> while <span class=\"sub-hl\">doing my homework</span> because <span class=\"sub-hl\">it’s hard for me to focus</span>. I prefer to focus on one task at a time so that I can <span class=\"sub-hl\">complete it more effectively</span>.",
                "vocab": [
                        {
                                "type": "purpose",
                                "title": "Mục đích / Lý do tập trung:",
                                "items": [
                                        {
                                                "en": "complete it more effectively",
                                                "vn": "hoàn thành hiệu quả hơn"
                                        },
                                        {
                                                "en": "give it my full attention",
                                                "vn": "tập trung toàn bộ sự chú ý"
                                        },
                                        {
                                                "en": "do it more carefully",
                                                "vn": "làm cẩn thận hơn"
                                        },
                                        {
                                                "en": "avoid making careless mistakes",
                                                "vn": "tránh mắc lỗi bất cẩn"
                                        },
                                        {
                                                "en": "absorb information better",
                                                "vn": "tiếp thu thông tin tốt hơn"
                                        }
                                ]
                        }
                ]
        },
        {
                "title": "3. Do you like/love/enjoy [hoạt động – Ving]?",
                "formula": "→ Yes, I do. I’m really into <strong>[hoạt động – Ving]</strong> because I find it <strong>[tính từ mô tả hoạt động]</strong>. It’s a good way to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>.",
                "examples": [
                        {
                                "q": "Do you like <span class='sub-hl'>reading books</span>?",
                                "a": "→ Yes, I do. I’m really into reading books because I find it very interesting. It’s a good way to clear my mind and widen my knowledge.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Yes, I do. I’m really into <strong>reading books</strong> because I find it <strong>very interesting</strong>. It’s a good way to <strong>clear my mind</strong> and <strong>widen my knowledge</strong>.</div>"
                        },
                        {
                                "q": "Do you like <span class='sub-hl'>traveling</span>?",
                                "a": "→ Yes, I do. I’m really into traveling because I find it extremely exciting. It’s a good way to explore new cultures and enrich my life experience.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Yes, I do. I’m really into <strong>traveling</strong> because I find it <strong>extremely exciting</strong>. It’s a good way to <strong>explore new cultures</strong> and <strong>enrich my life experience</strong>.</div>"
                        },
                        {
                                "q": "Do you love <span class='sub-hl'>playing musical instruments</span>?",
                                "a": "→ Yes, I do. I’m really into playing musical instruments because I find it very relaxing. It’s a good way to enhance my creativity and reduce stress.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Yes, I do. I’m really into <strong>playing musical instruments</strong> because I find it <strong>very relaxing</strong>. It’s a good way to <strong>enhance my creativity</strong> and <strong>reduce stress</strong>.</div>"
                        },
                        {
                                "q": "Do you enjoy <span class='sub-hl'>cooking</span>?",
                                "a": "→ Yes, I do. I’m really into cooking because I find it wonderful. It’s a good way to save money and stay healthy.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Yes, I do. I’m really into <strong>cooking</strong> because I find it <strong>wonderful</strong>. It’s a good way to <strong>save money</strong> and <strong>stay healthy</strong>.</div>"
                        },
                        {
                                "q": "Do you like <span class='sub-hl'>hanging out with your friends</span>?",
                                "a": "→ Yes, I do. I’m really into hanging out with my friends because I find it enjoyable. It’s a good way to strengthen our relationships and have fun.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Yes, I do. I’m really into <strong>hanging out with my friends</strong> because I find it <strong>enjoyable</strong>. It’s a good way to <strong>strengthen our relationships</strong> and <strong>have fun</strong>.</div>"
                        },
                        {
                                "q": "Do you love <span class='sub-hl'>doing volunteer work</span>?",
                                "a": "→ Yes, I do. I’m really into doing volunteer work because I find it meaningful. It’s a good way to help people in need and build soft skills.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Yes, I do. I’m really into <strong>doing volunteer work</strong> because I find it <strong>meaningful</strong>. It’s a good way to <strong>help people in need</strong> and <strong>build soft skills</strong>.</div>"
                        }
                ],
                "exQ": "Do you like <span class='sub-hl'>reading books</span>?",
                "exA": "→ Yes, I do. I’m really into reading books because I find it very interesting. It’s a good way to clear my mind and widen my knowledge.",
                "exAFormatted": "→ Yes, I do. I’m really into <span class=\"sub-hl\">reading books</span> because I find it <span class=\"sub-hl\">very interesting</span>. It’s a good way to <span class=\"sub-hl\">clear my mind</span> and <span class=\"sub-hl\">widen my knowledge</span>.",
                "vocab": [
                        {
                                "type": "adj",
                                "title": "Tính từ mô tả hoạt động:",
                                "items": [
                                                {
                                                                                                "en": "interesting",
                                                                                                "vn": "thú vị"
                                                },
                                                {
                                                                                                "en": "exciting",
                                                                                                "vn": "hào hứng"
                                                },
                                                {
                                                                                                "en": "relaxing",
                                                                                                "vn": "thư giãn"
                                                },
                                                {
                                                                                                "en": "enjoyable",
                                                                                                "vn": "thoải mái, thú vị"
                                                },
                                                {
                                                                                                "en": "meaningful",
                                                                                                "vn": "ý nghĩa"
                                                },
                                                {
                                                                                                "en": "beneficial",
                                                                                                "vn": "có lợi"
                                                },
                                                {
                                                                                                "en": "entertaining",
                                                                                                "vn": "mang tính giải trí"
                                                },
                                                {
                                                                                                "en": "fascinating",
                                                                                                "vn": "lôi cuốn, hấp dẫn"
                                                }
]
                        },
                        {
                                "type": "benefit",
                                "title": "Cụm Lợi ích:",
                                "items": [
                                        {
                                                "isNote": true,
                                                "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                        }
                                ]
                        }
                ]
        },
        {
                "title": "4. Did you often [hoạt động – V0] when you were a child?",
                "formula": "→ Sure. I used to <strong>[hoạt động – Vo]</strong> regularly when I was a child because I found it <strong>[tính từ mô tả hoạt động]</strong>. It allowed me to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>.",
                "examples": [
                        {
                                "q": "Did you often <span class='sub-hl'>watch cartoons</span> when you were a child?",
                                "a": "→ Sure. I used to watch cartoons regularly when I was a child because I found it entertaining. It allowed me to enjoy my free time and develop my imagination.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I used to <strong>watch cartoons</strong> regularly when I was a child because I found it <strong>entertaining</strong>. It allowed me to <strong>enjoy my free time</strong> and <strong>develop my imagination</strong>.</div>"
                        },
                        {
                                "q": "Did you often <span class='sub-hl'>play outside</span> when you were a child?",
                                "a": "→ Sure. I used to play outside regularly when I was a child because I found it fascinating. It allowed me to stay active and make new friends.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I used to <strong>play outside</strong> regularly when I was a child because I found it <strong>fascinating</strong>. It allowed me to <strong>stay active</strong> and <strong>make new friends</strong>.</div>"
                        },
                        {
                                "q": "Did you often <span class='sub-hl'>read books</span> when you were a child?",
                                "a": "→ Sure. I used to read books regularly when I was a child because I found it interesting. It allowed me to widen my knowledge and improve my reading skills.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I used to <strong>read books</strong> regularly when I was a child because I found it <strong>interesting</strong>. It allowed me to <strong>widen my knowledge</strong> and <strong>improve my reading skills</strong>.</div>"
                        },
                        {
                                "q": "Did you often <span class='sub-hl'>ride a bike</span> when you were a child?",
                                "a": "→ Sure. I used to ride a bike regularly when I was a child because I found it exciting. It allowed me to exercise and explore my neighborhood.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I used to <strong>ride a bike</strong> regularly when I was a child because I found it <strong>exciting</strong>. It allowed me to <strong>exercise</strong> and <strong>explore my neighborhood</strong>.</div>"
                        },
                        {
                                "q": "Did you often <span class='sub-hl'>play video games</span> when you were a child?",
                                "a": "→ Sure. I used to play video games regularly when I was a child because I found it thrilling. It allowed me to unwind after school and improve my reflexes.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I used to <strong>play video games</strong> regularly when I was a child because I found it <strong>thrilling</strong>. It allowed me to <strong>unwind after school</strong> and <strong>improve my reflexes</strong>.</div>"
                        },
                        {
                                "q": "Did you often <span class='sub-hl'>visit your grandparents</span> when you were a child?",
                                "a": "→ Sure. I used to visit my grandparents regularly when I was a child because I found it wonderful. It allowed me to enjoy family meals and create sweet childhood memories.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. I used to <strong>visit my grandparents</strong> regularly when I was a child because I found it <strong>wonderful</strong>. It allowed me to <strong>enjoy family meals</strong> and <strong>create sweet childhood memories</strong>.</div>"
                        }
                ],
                "exQ": "Did you often <span class='sub-hl'>watch cartoons</span> when you were a child?",
                "exA": "→ Sure. I used to watch cartoons regularly when I was a child because I found it entertaining. It allowed me to enjoy my free time and develop my imagination.",
                "exAFormatted": "→ Sure. I used to <span class=\"sub-hl\">watch cartoons</span> regularly when I was a child because I found it <span class=\"sub-hl\">entertaining</span>. It allowed me to <span class=\"sub-hl\">enjoy my free time</span> and <span class=\"sub-hl\">develop my imagination</span>.",
                "vocab": [
                        {
                                "type": "adj",
                                "title": "Tính từ mô tả hoạt động:",
                                "items": [
                                                {
                                                                                                "en": "interesting",
                                                                                                "vn": "thú vị"
                                                },
                                                {
                                                                                                "en": "exciting",
                                                                                                "vn": "hào hứng"
                                                },
                                                {
                                                                                                "en": "relaxing",
                                                                                                "vn": "thư giãn"
                                                },
                                                {
                                                                                                "en": "enjoyable",
                                                                                                "vn": "thoải mái, thú vị"
                                                },
                                                {
                                                                                                "en": "meaningful",
                                                                                                "vn": "ý nghĩa"
                                                },
                                                {
                                                                                                "en": "beneficial",
                                                                                                "vn": "có lợi"
                                                },
                                                {
                                                                                                "en": "entertaining",
                                                                                                "vn": "mang tính giải trí"
                                                },
                                                {
                                                                                                "en": "fascinating",
                                                                                                "vn": "lôi cuốn, hấp dẫn"
                                                }
]
                        },
                        {
                                "type": "benefit",
                                "title": "Cụm Lợi ích:",
                                "items": [
                                        {
                                                "isNote": true,
                                                "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                        }
                                ]
                        }
                ]
        },
        {
                "title": "5. Are you good at [hoạt động – Ving]?",
                "formula": "<div style='margin-bottom: 8px;'><strong>- Trả lời YES:</strong> → Sure. I'm quite good at <strong>[hoạt động – Ving]</strong> because I’ve practiced it for a long time. It allows me to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>.</div><div><strong>- Trả lời NO:</strong> → Not really. I'm not very good at <strong>[hoạt động – Ving]</strong> because I don't have much experience with it. However, I'm trying to improve by practicing more regularly.</div>",
                "examples": [
                        {
                                "q": "Are you good at <span class='sub-hl'>cooking</span>?",
                                "a": "→ I’m quite good at cooking because I've practiced it for a long time. It helps me save money and stay healthy.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (YES):</strong> → I’m quite good at <strong>cooking</strong> because I've practiced it for a long time. It helps me <strong>save money</strong> and <strong>stay healthy</strong>.</div><div style='margin-top: 6px;'><strong>- Trả lời (NO):</strong> → Not really. I’m not very good at <strong>cooking</strong> because I don't have much experience with it. However, I'm trying to improve by practicing more regularly.</div>"
                        },
                        {
                                "q": "Are you good at <span class='sub-hl'>speaking English</span>?",
                                "a": "→ Sure. I'm quite good at speaking English because I've practiced it for a long time. It allows me to communicate with foreigners and feel more confident.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (YES):</strong> → Sure. I'm quite good at <strong>speaking English</strong> because I've practiced it for a long time. It allows me to <strong>communicate with foreigners</strong> and <strong>feel more confident</strong>.</div><div style='margin-top: 6px;'><strong>- Trả lời (NO):</strong> → Not really. I'm not very good at <strong>speaking English</strong> because I don't have much experience with it. However, I'm trying to improve by practicing more regularly.</div>"
                        },
                        {
                                "q": "Are you good at <span class='sub-hl'>playing sports</span>?",
                                "a": "→ Sure. I'm quite good at playing sports because I've practiced it for a long time. It allows me to stay in good shape and reduce stress.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (YES):</strong> → Sure. I'm quite good at <strong>playing sports</strong> because I've practiced it for a long time. It allows me to <strong>stay in good shape</strong> and <strong>reduce stress</strong>.</div><div style='margin-top: 6px;'><strong>- Trả lời (NO):</strong> → Not really. I'm not very good at <strong>playing sports</strong> because I don't have much experience with it. However, I'm trying to improve by practicing more regularly.</div>"
                        },
                        {
                                "q": "Are you good at <span class='sub-hl'>using computers</span>?",
                                "a": "→ Sure. I'm quite good at using computers because I've practiced it for a long time. It allows me to work more efficiently and learn new skills.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (YES):</strong> → Sure. I'm quite good at <strong>using computers</strong> because I've practiced it for a long time. It allows me to <strong>work more efficiently</strong> and <strong>learn new skills</strong>.</div><div style='margin-top: 6px;'><strong>- Trả lời (NO):</strong> → Not really. I'm not very good at <strong>using computers</strong> because I don't have much experience with it. However, I'm trying to improve by practicing more regularly.</div>"
                        },
                        {
                                "q": "Are you good at <span class='sub-hl'>singing</span>?",
                                "a": "→ Not really. I'm not very good at singing because I don't have much talent for it. However, I still love singing karaoke with friends to have fun and relieve stress.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (NO):</strong> → Not really. I'm not very good at <strong>singing</strong> because I don't have much talent for it. However, I still love singing karaoke with friends to <strong>have fun</strong> and <strong>relieve stress</strong>.</div><div style='margin-top: 6px;'><strong>- Trả lời (YES):</strong> → Sure. I'm quite good at <strong>singing</strong> because I've practiced it for a long time. It allows me to <strong>entertain others</strong> and <strong>express my feelings</strong>.</div>"
                        },
                        {
                                "q": "Are you good at <span class='sub-hl'>drawing or painting</span>?",
                                "a": "→ Not really. I'm not very good at drawing because I don't have much experience with it. However, I'm trying to learn some basic techniques to enhance my creativity.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (NO):</strong> → Not really. I'm not very good at <strong>drawing</strong> because I don't have much experience with it. However, I'm trying to learn some basic techniques to <strong>enhance my creativity</strong>.</div><div style='margin-top: 6px;'><strong>- Trả lời (YES):</strong> → Sure. I'm quite good at <strong>drawing</strong> because I've practiced it for a long time. It allows me to <strong>relax my mind</strong> and <strong>create beautiful artwork</strong>.</div>"
                        }
                ],
                "exQ": "Are you good at <span class='sub-hl'>cooking</span>?",
                "exA": "→ I’m quite good at cooking because I've practiced it for a long time. It helps me save money and stay healthy.",
                "exAFormatted": "→ I’m quite good at <span class=\"sub-hl\">cooking</span> because <span class=\"sub-hl\">I've practiced it for a long time</span>. It allows me to <span class=\"sub-hl\">save money</span> and <span class=\"sub-hl\">stay healthy</span>.",
                "vocab": [
                        {
                                "type": "benefit",
                                "title": "Cụm Lợi ích (Khi trả lời YES):",
                                "items": [
                                        {
                                                "isNote": true,
                                                "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                        }
                                ]
                        }
                ]
        },
        {
                "title": "6. Are/Is […] important to you?",
                "formula": "<div style='margin-bottom: 8px;'><strong>- Trả lời YES:</strong> → Sure. <strong>[chủ đề]</strong> is definitely important to me because it allows me to <strong>[lợi ích 1]</strong>. It also gives me a chance to <strong>[lợi ích 2]</strong>.</div><div><strong>- Trả lời NO:</strong> → Not really. <strong>[chủ đề]</strong> isn’t very important to me because it doesn't play a big role in my daily life. Instead, I prefer to spend my time on <strong>[hoạt động / chủ đề khác]</strong>.</div>",
                "examples": [
                        {
                                "q": "Is <span class='sub-hl'>family</span> important to you?",
                                "a": "→ Sure. Family is definitely important to me because it allows me to feel supported during difficult times. Besides that, it gives me a chance to learn valuable life lessons.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. <strong>Family</strong> is definitely important to me because it allows me to <strong>feel supported during difficult times</strong>. Besides that, it gives me a chance to <strong>learn valuable life lessons</strong>.</div>"
                        },
                        {
                                "q": "Is <span class='sub-hl'>music</span> important to you?",
                                "a": "→ Sure. Music is definitely important to me because it allows me to relax after a long day. It also gives me a chance to improve my mood.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. <strong>Music</strong> is definitely important to me because it allows me to <strong>relax after a long day</strong>. It also gives me a chance to <strong>improve my mood</strong>.</div>"
                        },
                        {
                                "q": "Are <span class='sub-hl'>hobbies</span> important to you?",
                                "a": "→ Sure. Hobbies are definitely important to me because they allow me to develop new skills. They also give me a chance to reduce daily stress.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. <strong>Hobbies</strong> are definitely important to me because they allow me to <strong>develop new skills</strong>. They also give me a chance to <strong>reduce daily stress</strong>.</div>"
                        },
                        {
                                "q": "Are <span class='sub-hl'>soft skills</span> important to you?",
                                "a": "→ Sure. Soft skills are definitely important to me because they allow me to work effectively in a team. They also give me a chance to advance my career.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. <strong>Soft skills</strong> are definitely important to me because they allow me to <strong>work effectively in a team</strong>. They also give me a chance to <strong>advance my career</strong>.</div>"
                        },
                        {
                                "q": "Is <span class='sub-hl'>health</span> important to you?",
                                "a": "→ Sure. Health is definitely important to me because it allows me to stay energetic and live happily. It also gives me a chance to pursue my long-term goals.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. <strong>Health</strong> is definitely important to me because it allows me to <strong>stay energetic and live happily</strong>. It also gives me a chance to <strong>pursue my long-term goals</strong>.</div>"
                        },
                        {
                                "q": "Is <span class='sub-hl'>friendship</span> important to you?",
                                "a": "→ Sure. Friendship is definitely important to me because it allows me to share life experiences and receive emotional support whenever I face challenges.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Sure. <strong>Friendship</strong> is definitely important to me because it allows me to <strong>share life experiences</strong> and <strong>receive emotional support whenever I face challenges</strong>.</div>"
                        }
                ],
                "exQ": "Is <span class='sub-hl'>family</span> important to you?",
                "exA": "→ Sure. Family is definitely important to me because it allows me to feel supported during difficult times. Besides that, it gives me a chance to learn valuable life lessons.",
                "exAFormatted": "→ Sure. <span class=\"sub-hl\">Family</span> is definitely important to me because it allows me to <span class=\"sub-hl\">feel supported during difficult times</span>. Besides that, it gives me a chance to <span class=\"sub-hl\">learn valuable life lessons</span>.",
                "vocab": [
                        {
                                "type": "benefit",
                                "title": "Cụm Lợi ích / Giá trị:",
                                "items": [
                                        {
                                                "isNote": true,
                                                "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                        }
                                ]
                        }
                ]
        },
        {
                "title": "7. Have you ever [hoạt động – V3/ed]?",
                "formula": "<div style='margin-bottom: 8px;'><strong>- Trả lời ĐÃ TỪNG:</strong> → Yes, I <strong>[hoạt động – V2]</strong> a while ago, and I found it <strong>[tính từ mô tả trải nghiệm]</strong>. It allowed me to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>.</div><div><strong>- Trả lời CHƯA TỪNG:</strong> → Not yet. I haven't had the chance to <strong>[hoạt động – V0]</strong> yet. However, I'd love to try it one day because I think it would be a/an <strong>[tính từ mô tả trải nghiệm]</strong> experience.</div>",
                "examples": [
                        {
                                "q": "Have you ever <span class='sub-hl'>attended a live concert</span>?",
                                "a": "→ Yes, I attended a live concert a few years ago, and I found it really exciting. It allowed me to enjoy live music and experience the amazing atmosphere.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (ĐÃ TỪNG):</strong> → Yes, I <strong>attended a live concert</strong> a few years ago, and I found it <strong>really exciting</strong>. It allowed me to <strong>enjoy live music</strong> and <strong>experience the amazing atmosphere</strong>.</div>"
                        },
                        {
                                "q": "Have you ever <span class='sub-hl'>traveled abroad</span>?",
                                "a": "→ Not yet. I haven't had the chance to travel abroad yet. However, I'd love to try it one day because I think it would be an unforgettable experience.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (CHƯA TỪNG):</strong> → Not yet. I haven't had the chance to <strong>travel abroad</strong> yet. However, I'd love to try it one day because I think it would be an <strong>unforgettable experience</strong>.</div>"
                        },
                        {
                                "q": "Have you ever <span class='sub-hl'>tried Vietnamese food</span>?",
                                "a": "→ Yes, I tried Vietnamese food a while ago, and I found it extremely delicious. It allowed me to discover new flavors and learn about Vietnamese cuisine.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (ĐÃ TỪNG):</strong> → Yes, I <strong>tried Vietnamese food</strong> a while ago, and I found it <strong>extremely delicious</strong>. It allowed me to <strong>discover new flavors</strong> and <strong>learn about Vietnamese cuisine</strong>.</div>"
                        },
                        {
                                "q": "Have you ever <span class='sub-hl'>learned to play a musical instrument</span>?",
                                "a": "→ Not yet. I haven't had the chance to learn to play a musical instrument yet. However, I'd love to try it one day because I think it would be a rewarding experience.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (CHƯA TỪNG):</strong> → Not yet. I haven't had the chance to <strong>learn to play a musical instrument</strong> yet. However, I'd love to try it one day because I think it would be a <strong>rewarding experience</strong>.</div>"
                        },
                        {
                                "q": "Have you ever <span class='sub-hl'>done volunteer work</span>?",
                                "a": "→ Yes, I did volunteer work last summer, and I found it very meaningful. It allowed me to help disadvantaged people and develop practical teamwork skills.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (ĐÃ TỪNG):</strong> → Yes, I <strong>did volunteer work</strong> last summer, and I found it <strong>very meaningful</strong>. It allowed me to <strong>help disadvantaged people</strong> and <strong>develop practical teamwork skills</strong>.</div>"
                        },
                        {
                                "q": "Have you ever <span class='sub-hl'>given a public speech</span>?",
                                "a": "→ Yes, I gave a presentation in front of my class a month ago, and I found it quite challenging but rewarding. It allowed me to overcome stage fright and boost my confidence.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời (ĐÃ TỪNG):</strong> → Yes, I <strong>gave a presentation</strong> in front of my class a month ago, and I found it <strong>quite challenging but rewarding</strong>. It allowed me to <strong>overcome stage fright</strong> and <strong>boost my confidence</strong>.</div>"
                        }
                ],
                "exQ": "Have you ever <span class='sub-hl'>attended a live concert</span>?",
                "exA": "→ Yes, I attended a live concert a few years ago, and I found it really exciting. It allowed me to enjoy live music and experience the amazing atmosphere.",
                "exAFormatted": "→ Yes, I <span class=\"sub-hl\">attended a live concert</span> a few years ago, and I found it <span class=\"sub-hl\">really exciting</span>. It allowed me to <span class=\"sub-hl\">enjoy live music</span> and <span class=\"sub-hl\">experience the amazing atmosphere</span>.",
                "vocab": [
                        {
                                "type": "adj",
                                "title": "Tính từ mô tả trải nghiệm:",
                                "items": [
                                                {
                                                                                                "en": "unforgettable",
                                                                                                "vn": "khó quên, đáng nhớ"
                                                },
                                                {
                                                                                                "en": "exciting",
                                                                                                "vn": "hào hứng"
                                                },
                                                {
                                                                                                "en": "wonderful",
                                                                                                "vn": "tuyệt vời"
                                                },
                                                {
                                                                                                "en": "rewarding",
                                                                                                "vn": "bổ ích, đáng giá"
                                                },
                                                {
                                                                                                "en": "fascinating",
                                                                                                "vn": "lôi cuốn, hấp dẫn"
                                                }
]
                        }
                ]
        }
];


    window.formatTitleHighlight = (title) => {
        if (!title) return '';
        return title
            .replace(/\s+\?/g, '?')
            .replace(/\[(.*?)\]/g, '<span class="title-bracket-hl">[$1]</span>');
    };

    window.formatFormulaHighlight = (formHtml) => {
        if (!formHtml) return '';
        let res = formHtml.replace(/<strong>\s*\[(.*?)\]\s*<\/strong>/g, "[$1]");
        return res.replace(/\[(.*?)\]/g, '<span class="formula-bracket-hl">[$1]</span>');
    };

    window.getExamplesBlockHTML = (item) => {
        if (!item || !item.examples || !item.examples.length) return '';
        
        return `
            <div class="accordion-box" onclick="this.classList.toggle('open')" style="margin-bottom: 1.25rem; border: 2px solid #f59e0b; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px -2px rgba(245, 158, 11, 0.15);">
                <div class="accordion-header" style="padding: 1rem 1.25rem; background: rgba(245, 158, 11, 0.08);">
                    <div class="acc-title" style="color:#d97706; font-size:1.05rem; font-weight: 700;">
                        <i class="fa-solid fa-list-ul"></i> CÁC CÂU HỎI VÍ DỤ (${item.examples.length} câu)
                    </div>
                    <div class="acc-toggle" style="background:#d97706;"><span class="txt-close"><i class="fa-solid fa-hand-pointer"></i> Nhấn để xem ví dụ ▼</span><span class="txt-open"><i class="fa-solid fa-chevron-up"></i> Thu gọn ▲</span></div>
                </div>
                <div class="accordion-content" onclick="event.stopPropagation()" style="padding: 1rem 1.25rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                        ${item.examples.map((ex, idx) => `
                            <div class="example-q-item" style="background: var(--bg-card, #ffffff); border: 1px solid rgba(245, 158, 11, 0.25); border-left: 4px solid #f59e0b; padding: 0.85rem 1rem; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; gap: 0.85rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03); transition: all 0.2s ease;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #fef3c7; color: #b45309; font-weight: 800; font-size: 0.85rem; flex-shrink: 0; border: 1px solid rgba(245, 158, 11, 0.3);">${idx + 1}</span>
                                    <span style="font-size: 1.05rem; color: var(--text-main); font-weight: 500; line-height: 1.5;">${ex.q}</span>
                                </div>
                                <button class="icon-btn" style="width: 34px; height: 34px; border-radius: 8px; background: rgba(245, 158, 11, 0.12); color: #d97706; font-size: 0.95rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(245, 158, 11, 0.25); transition: all 0.2s;" onclick="event.stopPropagation(); speakText('${ex.q.replace(/<[^>]+>/g, '').replace(/'/g, "\\'")}')" title="Nghe phát âm câu hỏi">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    };

    window.getSuggestionsHTML = (item) => {
        if (!item || !item.vocab || !item.vocab.length) return '';

        let html = `
            <div class="sugg-container mt-3 pt-3 fade-in" style="border-top: 1px dashed var(--border); text-align: left;">
                <div style="font-weight: 700; color: #059669; font-size: 0.95rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-list-check"></i> GỢI Ý TỪ VỰNG:
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.92rem; line-height: 1.6;">`;

        item.vocab.forEach(group => {
            const isBlue = group.type === 'benefit';
            const col = isBlue ? '#2563eb' : '#059669';
            const bg = isBlue ? 'rgba(59, 130, 246, 0.06)' : 'rgba(16, 185, 129, 0.06)';
            const border = isBlue ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)';
            let icon = 'fa-solid fa-lightbulb';
            if (group.type === 'benefit') icon = 'fa-solid fa-star';
            else if (group.type === 'time') icon = 'fa-regular fa-clock';
            else if (group.type === 'emotion') icon = 'fa-solid fa-face-smile';
            else if (group.type === 'activity') icon = 'fa-solid fa-wand-magic-sparkles';
            if (group.icon) icon = group.icon;

            html += `
                    <div style="background: ${bg}; padding: 0.85rem 1rem; border-radius: 10px; border: 1px solid ${border};">
                        <div style="color: ${col}; font-weight: 700; margin-bottom: 0.5rem; font-size: 0.95rem;"><i class="${icon}"></i> ${group.title}</div>
                        <div style="color: var(--text-main); display: flex; flex-direction: column; gap: 0.5rem;">`;
            group.items.forEach(pair => {
                if (pair.isNote) {
                    html += `
                            <div style="font-style: italic; color: #64748b; font-weight: 500; display: flex; align-items: center; padding: 0.25rem 0;">
                                ${pair.vn}
                            </div>`;
                } else {
                    html += `
                            <div>
                                <button type="button" onclick="event.stopPropagation(); speakText('${pair.en}')" title="Nghe phát âm" style="background: none; border: none; color: ${col}; cursor: pointer; padding: 0 0.4rem 0 0; font-size: 1rem;"><i class="fa-solid fa-volume-high"></i></button>
                                <strong>${pair.en}</strong>: ${pair.vn}
                            </div>`;
                }
            });
            html += `
                        </div>
                    </div>`;
        });

        html += `
                </div>
            </div>`;
        return html;
    };

    const ynStage = document.getElementById('yn-stage');
    const ynNumEl = document.getElementById('yn-current-num');

    const renderYnSlide = () => {
        if (!ynStage) return;
        const d = ynFormulas[state.ynIndex];
        if (ynNumEl) ynNumEl.textContent = state.ynIndex + 1;
        ynStage.innerHTML = `
            <div class="f-card-clean fade-in">
                <div class="f-title" style="margin-bottom:1.5rem;">${formatTitleHighlight(d.title)}</div>
                ${getExamplesBlockHTML(d)}
                
                <div class="accordion-box" onclick="this.classList.toggle('open')" style="margin-bottom: 1.25rem; border: 2px solid #3b82f6; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);">
                    <div class="accordion-header" style="padding: 1rem 1.25rem; background: rgba(59, 130, 246, 0.08);">
                        <div class="acc-title" style="color:#2563eb; font-size:1.05rem;"><i class="fa-solid fa-lightbulb"></i> GỢI Ý CÂU TRẢ LỜI</div>
                        <div class="acc-toggle" style="background:#2563eb;"><span class="txt-close"><i class="fa-solid fa-hand-pointer"></i> Nhấn để xem gợi ý câu trả lời ▼</span><span class="txt-open"><i class="fa-solid fa-chevron-up"></i> Thu gọn ▲</span></div>
                    </div>
                    <div class="accordion-content" onclick="event.stopPropagation()">
                        <div class="f-formula-box" style="margin: 0; border: none; background: transparent; padding: 0.5rem 0;">${formatFormulaHighlight(d.formula)}</div>
                        ${getSuggestionsHTML(d)}
                    </div>
                </div>

                <div class="accordion-box" onclick="this.classList.toggle('open')" style="margin-bottom: 0; border: 2px solid #8b5cf6; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.1);">
                    <div class="accordion-header" style="padding: 1rem 1.25rem; background: rgba(139, 92, 246, 0.08);">
                        <div class="acc-title" style="color:#7c3aed; font-size:1.05rem;"><i class="fa-solid fa-desktop"></i> VÍ DỤ THỰC HÀNH</div>
                        <div class="acc-toggle" style="background:#7c3aed;"><span class="txt-close"><i class="fa-solid fa-hand-pointer"></i> Nhấn vào hiện câu hỏi ▼</span><span class="txt-open"><i class="fa-solid fa-chevron-up"></i> Thu gọn ▲</span></div>
                    </div>
                    <div class="accordion-content" onclick="event.stopPropagation()">
                        <div class="f-example-box" style="margin: 0; border: none; background: transparent; padding: 0.5rem 0;">
                            <div class="ex-label" style="font-size:1.1rem; color:var(--text-main); margin-bottom:0.75rem; text-transform:none;">
                                ❓ Câu hỏi: <strong>${d.exQ}</strong>
                            </div>
                            <div style="margin-top:0.75rem;">
                                <button class="btn-audio-sample" style="background:#8b5cf6; margin-bottom:0.5rem; cursor:pointer;" onclick="toggleSampleAnswer(this)">
                                    <i class="fa-solid fa-eye"></i> Nhấn xem câu trả lời mẫu
                                </button>
                                <div class="fade-in" style="display:none; margin-top:0.75rem; padding-top:0.75rem; border-top:1px dashed var(--border);">
                                    <div class="ex-text" style="color:var(--secondary); font-weight:500; font-size:1.05rem; line-height:1.8;">${d.exAFormatted || d.exA}</div>
                                    <button class="btn-audio-sample mt-2" onclick="speakText('${d.exA.replace(/<[^>]*>/g, '').replace(/→/g, '').replace(/'/g, "\\'").trim()}')">
                                        <i class="fa-solid fa-volume-high"></i> Nghe Audio phát âm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    document.getElementById('yn-prev')?.addEventListener('click', () => {
        state.ynIndex = (state.ynIndex - 1 + ynFormulas.length) % ynFormulas.length;
        renderYnSlide();
    });
    document.getElementById('yn-next')?.addEventListener('click', () => {
        state.ynIndex = (state.ynIndex + 1) % ynFormulas.length;
        renderYnSlide();
    });
    renderYnSlide();

    // 4. CHOICE QUESTIONS TABS
    const cTabs = document.querySelectorAll('.c-tab');
    const choiceBox = document.getElementById('choice-display-box');

            const choiceData = {
        "opt1": {
                "title": "✅ PHƯƠNG ÁN 1 – CHỌN 1 TRONG 2",
                "form": "→ Personally, I prefer <strong>[lựa chọn – noun/Ving]</strong> because I find it more <strong>[tính từ mô tả lựa chọn]</strong>. It allows me to <strong>[lợi ích 1]</strong> and gives me a chance to <strong>[lợi ích 2]</strong>.",
                "audio": "Personally, I prefer studying in the library because I find it more peaceful. It allows me to concentrate better and gives me a chance to avoid distractions.",
                "examples": [
                        {
                                "q": "Do you prefer <span class='sub-hl'>studying at home</span> or <span class='sub-hl'>in the library</span>?",
                                "a": "→ Personally, I prefer studying in the library because I find it more peaceful. It allows me to concentrate better and gives me a chance to avoid distractions.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Personally, I prefer <strong>studying in the library</strong> because I find it more <strong>peaceful</strong>. It allows me to <strong>concentrate better</strong> and gives me a chance to <strong>avoid distractions</strong>.</div>"
                        },
                        {
                                "q": "Do you prefer <span class='sub-hl'>paper books</span> or <span class='sub-hl'>e-books</span>?",
                                "a": "→ Personally, I prefer paper books because I find them more authentic. It allows me to protect my eyesight and gives me a chance to enjoy the feeling of turning pages.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Personally, I prefer <strong>paper books</strong> because I find them more <strong>authentic</strong>. It allows me to <strong>protect my eyesight</strong> and gives me a chance to <strong>enjoy the feeling of turning pages</strong>.</div>"
                        },
                        {
                                "q": "Do you prefer <span class='sub-hl'>traveling alone</span> or <span class='sub-hl'>with friends</span>?",
                                "a": "→ Personally, I prefer traveling with friends because I find it more enjoyable. It allows me to share great memories and gives me a chance to strengthen our friendships.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Personally, I prefer <strong>traveling with friends</strong> because I find it more <strong>enjoyable</strong>. It allows me to <strong>share great memories</strong> and gives me a chance to <strong>strengthen our friendships</strong>.</div>"
                        },
                        {
                                "q": "Do you prefer <span class='sub-hl'>watching movies at home</span> or <span class='sub-hl'>at the cinema</span>?",
                                "a": "→ Personally, I prefer watching movies at the cinema because I find it more thrilling. It allows me to enjoy top-quality sound effects and gives me a chance to experience the movie fully.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Personally, I prefer <strong>watching movies at the cinema</strong> because I find it more <strong>thrilling</strong>. It allows me to <strong>enjoy top-quality sound effects</strong> and gives me a chance to <strong>experience the movie fully</strong>.</div>"
                        },
                        {
                                "q": "Do you prefer <span class='sub-hl'>shopping online</span> or <span class='sub-hl'>in traditional stores</span>?",
                                "a": "→ Personally, I prefer shopping online because I find it more convenient. It allows me to compare prices easily and gives me a chance to save a lot of time.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Personally, I prefer <strong>shopping online</strong> because I find it more <strong>convenient</strong>. It allows me to <strong>compare prices easily</strong> and gives me a chance to <strong>save a lot of time</strong>.</div>"
                        },
                        {
                                "q": "Do you prefer <span class='sub-hl'>living in a big city</span> or <span class='sub-hl'>in the countryside</span>?",
                                "a": "→ Personally, I prefer living in a big city because I find it more dynamic. It allows me to access better educational facilities and gives me a chance to explore career opportunities.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Personally, I prefer <strong>living in a big city</strong> because I find it more <strong>dynamic</strong>. It allows me to <strong>access better educational facilities</strong> and gives me a chance to <strong>explore career opportunities</strong>.</div>"
                        }
                ],
                "exQ": "Do you prefer <span class='sub-hl'>studying at home</span> or <span class='sub-hl'>in the library</span>?",
                "exA": "→ Personally, I prefer studying in the library because I find it more peaceful. It allows me to concentrate better and gives me a chance to avoid distractions.",
                "exAFormatted": "→ Personally, I prefer <span class=\"sub-hl\">studying in the library</span> because I find it more <span class=\"sub-hl\">peaceful</span>. It allows me to <span class=\"sub-hl\">concentrate better</span> and gives me a chance to <span class=\"sub-hl\">avoid distractions</span>.",
                "vocab": [
                        {
                                "type": "adj",
                                "title": "Tính từ so sánh lựa chọn:",
                                "items": [
                                                {
                                                                                                "en": "convenient",
                                                                                                "vn": "tiện lợi"
                                                },
                                                {
                                                                                                "en": "peaceful",
                                                                                                "vn": "yên tĩnh"
                                                },
                                                {
                                                                                                "en": "enjoyable",
                                                                                                "vn": "thú vị"
                                                },
                                                {
                                                                                                "en": "comfortable",
                                                                                                "vn": "thoải mái"
                                                },
                                                {
                                                                                                "en": "economical",
                                                                                                "vn": "tiết kiệm"
                                                },
                                                {
                                                                                                "en": "authentic",
                                                                                                "vn": "chân thực"
                                                },
                                                {
                                                                                                "en": "dynamic",
                                                                                                "vn": "năng động"
                                                }
]
                        },
                        {
                                "type": "benefit",
                                "title": "Cụm Lợi ích:",
                                "items": [
                                        {
                                                "isNote": true,
                                                "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                        }
                                ]
                        }
                ]
        },
        "opt2": {
                "title": "✅ PHƯƠNG ÁN 2 – CẢ HAI ĐỀU QUAN TRỌNG",
                "form": "→ I think both are equally important because they offer different benefits. <strong>[A]</strong> helps me <strong>[lợi ích của A]</strong>, while <strong>[B]</strong> allows me to <strong>[lợi ích của B]</strong>.",
                "audio": "I think both are equally important because they offer different benefits. Money helps me meet my daily needs, while happiness allows me to enjoy life and maintain good mental health.",
                "examples": [
                        {
                                "q": "Which is more important, <span class='sub-hl'>money</span> or <span class='sub-hl'>happiness</span>?",
                                "a": "→ I think both are equally important because they offer different benefits. Money helps me meet my daily needs, while happiness allows me to enjoy life and maintain good mental health.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I think both are equally important because they offer different benefits. <strong>Money</strong> helps me <strong>meet my daily needs</strong>, while <strong>happiness</strong> allows me to <strong>enjoy life and maintain good mental health</strong>.</div>"
                        },
                        {
                                "q": "Which is more important, <span class='sub-hl'>family</span> or <span class='sub-hl'>work</span>?",
                                "a": "→ I think both are equally important because they offer different benefits. Work helps me earn a living and develop my career, while family provides emotional support and unconditional love.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I think both are equally important because they offer different benefits. <strong>Work</strong> helps me <strong>earn a living and develop my career</strong>, while <strong>family</strong> provides <strong>emotional support and unconditional love</strong>.</div>"
                        },
                        {
                                "q": "Which is more important, <span class='sub-hl'>practical skills</span> or <span class='sub-hl'>academic knowledge</span>?",
                                "a": "→ I think both are equally important because they offer different benefits. Academic knowledge provides a strong theoretical background, while practical skills allow me to solve real-world problems effectively.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I think both are equally important because they offer different benefits. <strong>Academic knowledge</strong> provides a strong theoretical background, while <strong>practical skills</strong> allow me to solve real-world problems effectively.</div>"
                        },
                        {
                                "q": "Which is more important, <span class='sub-hl'>physical health</span> or <span class='sub-hl'>mental health</span>?",
                                "a": "→ I think both are equally important because they offer different benefits. Physical health keeps my body strong and active, while mental health allows me to stay optimistic and manage daily stress.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I think both are equally important because they offer different benefits. <strong>Physical health</strong> keeps my body strong and active, while <strong>mental health</strong> allows me to stay optimistic and manage daily stress.</div>"
                        },
                        {
                                "q": "Which is more important, <span class='sub-hl'>talent</span> or <span class='sub-hl'>hard work</span>?",
                                "a": "→ I think both are equally important because they offer different benefits. Talent gives us an initial advantage, while hard work allows us to develop discipline and achieve long-term success.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I think both are equally important because they offer different benefits. <strong>Talent</strong> gives us an initial advantage, while <strong>hard work</strong> allows us to develop discipline and achieve long-term success.</div>"
                        },
                        {
                                "q": "Which is more important, <span class='sub-hl'>individual study</span> or <span class='sub-hl'>group study</span>?",
                                "a": "→ I think both are equally important because they offer different benefits. Individual study helps me focus on personal weaknesses, while group study allows me to exchange ideas and learn from peers.",
                                "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I think both are equally important because they offer different benefits. <strong>Individual study</strong> helps me focus on personal weaknesses, while <strong>group study</strong> allows me to exchange ideas and learn from peers.</div>"
                        }
                ],
                "exQ": "Which is more important, <span class='sub-hl'>money</span> or <span class='sub-hl'>happiness</span>?",
                "exA": "→ I think both are equally important because they offer different benefits. Money helps me meet my daily needs, while happiness allows me to enjoy life and maintain good mental health.",
                "exAFormatted": "→ I think both are equally important because they offer different benefits. <span class=\"sub-hl\">Money</span> helps me <span class=\"sub-hl\">meet my daily needs</span>, while <span class=\"sub-hl\">happiness</span> allows me to <span class=\"sub-hl\">enjoy life and maintain good mental health</span>.",
                "vocab": [
                        {
                                "type": "benefit",
                                "title": "Cụm Lợi ích song song:",
                                "items": [
                                        {
                                                "isNote": true,
                                                "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                        }
                                ]
                        }
                ]
        }
};

const renderChoice = (o) => {
        if (!choiceBox || !choiceData[o]) return;
        const d = choiceData[o];
        choiceBox.innerHTML = `
            <div class="f-card-clean fade-in" style="max-width:100%;">
                <div class="f-title" style="margin-bottom:1.5rem;">${formatTitleHighlight(d.title)}</div>
                
                <div class="accordion-box" onclick="this.classList.toggle('open')" style="margin-bottom: 1.25rem; border: 2px solid #3b82f6; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);">
                    <div class="accordion-header" style="padding: 1rem 1.25rem; background: rgba(59, 130, 246, 0.08);">
                        <div class="acc-title" style="color:#2563eb; font-size:1.05rem;"><i class="fa-solid fa-lightbulb"></i> GỢI Ý CÂU TRẢ LỜI</div>
                        <div class="acc-toggle" style="background:#2563eb;"><span class="txt-close"><i class="fa-solid fa-hand-pointer"></i> Nhấn để xem gợi ý câu trả lời ▼</span><span class="txt-open"><i class="fa-solid fa-chevron-up"></i> Thu gọn ▲</span></div>
                    </div>
                    <div class="accordion-content" onclick="event.stopPropagation()">
                        <div class="f-formula-box" style="margin: 0; border: none; background: transparent; padding: 0.5rem 0;">${formatFormulaHighlight(d.form)}</div>
                        ${getSuggestionsHTML(d)}
                    </div>
                </div>

                <div class="accordion-box" onclick="this.classList.toggle('open')" style="margin-bottom: 0; border: 2px solid #8b5cf6; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.1);">
                    <div class="accordion-header" style="padding: 1rem 1.25rem; background: rgba(139, 92, 246, 0.08);">
                        <div class="acc-title" style="color:#7c3aed; font-size:1.05rem;"><i class="fa-solid fa-desktop"></i> VÍ DỤ THỰC HÀNH</div>
                        <div class="acc-toggle" style="background:#7c3aed;"><span class="txt-close"><i class="fa-solid fa-hand-pointer"></i> Nhấn vào hiện câu hỏi ▼</span><span class="txt-open"><i class="fa-solid fa-chevron-up"></i> Thu gọn ▲</span></div>
                    </div>
                    <div class="accordion-content" onclick="event.stopPropagation()">
                        <div class="f-example-box" style="margin: 0; border: none; background: transparent; padding: 0.5rem 0;">
                            <div class="ex-label" style="font-size:1.1rem; color:var(--text-main); margin-bottom:0.75rem; text-transform:none;">
                                ❓ Câu hỏi: <strong>${d.exQ}</strong>
                            </div>
                            <div style="margin-top:0.75rem;">
                                <button class="btn-audio-sample" style="background:#8b5cf6; margin-bottom:0.5rem; cursor:pointer;" onclick="toggleSampleAnswer(this)">
                                    <i class="fa-solid fa-eye"></i> Nhấn xem câu trả lời mẫu
                                </button>
                                <div class="fade-in" style="display:none; margin-top:0.75rem; padding-top:0.75rem; border-top:1px dashed var(--border);">
                                    <div class="ex-text" style="color:var(--secondary); font-weight:500; font-size:1.05rem; line-height:1.8;">${d.exAFormatted || d.exA}</div>
                                    <button class="btn-audio-sample mt-2" onclick="speakText('${d.audio.replace(/<[^>]*>/g, '').replace(/'/g, "\\'")}')">
                                        <i class="fa-solid fa-volume-high"></i> Nghe Audio phát âm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    cTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            cTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderChoice(tab.getAttribute('data-opt'));
        });
    });
    renderChoice('opt1');
    const choiceExamplesBox = document.getElementById('choice-examples-box');
    if (choiceExamplesBox && choiceData['opt1']) {
        choiceExamplesBox.innerHTML = getExamplesBlockHTML(choiceData['opt1']);
    }

    // 5. WH-QUESTIONS SHOWCASE (15 Formulas exactly from PowerPoint)
            const whBank = {
        "what": [
                {
                        "title": "1. What do you often do [thời gian]?",
                        "formula": "<div style='margin-bottom: 8px;'><strong>- Cách 1:</strong> → I tend to <strong>[hoạt động – Vo]</strong> <strong>[thời gian]</strong> because I find it <strong>[tính từ mô tả hoạt động]</strong>. It allows me to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>.</div><div><strong>- Cách 2:</strong> → I usually <strong>[hoạt động 1 – Vo]</strong> <strong>[thời gian]</strong> because it allows me to <strong>[lợi ích 1]</strong>. Sometimes, I also <strong>[hoạt động 2 – Vo]</strong>, which gives me a chance to <strong>[lợi ích 2]</strong>.</div>",
                        "examples": [
                                {
                                        "q": "What do you often do <span class='sub-hl'>in the evening</span>?",
                                        "a": "→ I tend to watch movies in the evening because I find it relaxing. It allows me to broaden my knowledge and clear my mind.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I tend to <strong>watch movies</strong> <strong>in the evening</strong> because I find it <strong>relaxing</strong>. It allows me to <strong>broaden my knowledge</strong> and <strong>clear my mind</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do <span class='sub-hl'>in the afternoon</span>?",
                                        "a": "→ I usually read books in the afternoon because it allows me to widen my knowledge. Sometimes, I also listen to music, which gives me a chance to relax after a busy day.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>read books</strong> <strong>in the afternoon</strong> because it allows me to <strong>widen my knowledge</strong>. Sometimes, I also <strong>listen to music</strong>, which gives me a chance to <strong>relax after a busy day</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do <span class='sub-hl'>in your free time</span>?",
                                        "a": "→ I tend to play sports in my free time because I find it energetic. It allows me to stay in good shape and boost my stamina.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I tend to <strong>play sports</strong> <strong>in my free time</strong> because I find it <strong>energetic</strong>. It allows me to <strong>stay in good shape</strong> and <strong>boost my stamina</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do <span class='sub-hl'>at weekends</span>?",
                                        "a": "→ I usually hang out with my friends at weekends because it allows me to have fun. Sometimes, I also go shopping, which gives me a chance to buy necessary items.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>hang out with my friends</strong> <strong>at weekends</strong> because it allows me to <strong>have fun</strong>. Sometimes, I also <strong>go shopping</strong>, which gives me a chance to <strong>buy necessary items</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do <span class='sub-hl'>after school</span>?",
                                        "a": "→ I tend to listen to music after school because I find it very soothing. It allows me to reduce stress and refresh my mind.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I tend to <strong>listen to music</strong> <strong>after school</strong> because I find it <strong>very soothing</strong>. It allows me to <strong>reduce stress</strong> and <strong>refresh my mind</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do <span class='sub-hl'>in the morning</span>?",
                                        "a": "→ I tend to go jogging in the morning because I find it refreshing. It allows me to breathe fresh air and stay energized for the whole day.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I tend to <strong>go jogging</strong> <strong>in the morning</strong> because I find it <strong>refreshing</strong>. It allows me to <strong>breathe fresh air</strong> and <strong>stay energized for the whole day</strong>.</div>"
                                }
                        ],
                        "exQ": "What do you often do <span class='sub-hl'>in the evening</span>?",
                        "exA": "→ I tend to watch movies in the evening because I find it relaxing. It allows me to broaden my knowledge and clear my mind.",
                        "exAFormatted": "→ I tend to <span class=\"sub-hl\">watch movies</span> <span class=\"sub-hl\">in the evening</span> because I find it <span class=\"sub-hl\">relaxing</span>. It allows me to <span class=\"sub-hl\">broaden my knowledge</span> and <span class=\"sub-hl\">clear my mind</span>.",
                        "vocab": [
                                {
                                        "type": "time",
                                        "title": "Cụm Thời gian:",
                                        "items": [
                                                {
                                                        "en": "in the morning",
                                                        "vn": "vào buổi sáng"
                                                },
                                                {
                                                        "en": "in the afternoon",
                                                        "vn": "vào buổi chiều"
                                                },
                                                {
                                                        "en": "in the evening",
                                                        "vn": "vào buổi tối"
                                                },
                                                {
                                                        "en": "at night",
                                                        "vn": "vào ban đêm"
                                                },
                                                {
                                                        "en": "at weekends",
                                                        "vn": "vào cuối tuần"
                                                },
                                                {
                                                        "en": "on weekdays",
                                                        "vn": "vào các ngày trong tuần"
                                                },
                                                {
                                                        "en": "on my days off",
                                                        "vn": "vào những ngày nghỉ"
                                                },
                                                {
                                                        "en": "in my free time",
                                                        "vn": "vào thời gian rảnh rỗi"
                                                },
                                                {
                                        "en": "after school",
                                        "vn": "sau giờ học"
                                },
                                {
                                        "en": "after work",
                                        "vn": "sau giờ làm"
                                }
                                        ]
                                },
                                {
                                "type": "adj",
                                "title": "Tính từ mô tả hoạt động:",
                                "items": [
                                                {
                                                                                                "en": "interesting",
                                                                                                "vn": "thú vị"
                                                },
                                                {
                                                                                                "en": "exciting",
                                                                                                "vn": "hào hứng"
                                                },
                                                {
                                                                                                "en": "relaxing",
                                                                                                "vn": "thư giãn"
                                                },
                                                {
                                                                                                "en": "enjoyable",
                                                                                                "vn": "thoải mái, thú vị"
                                                },
                                                {
                                                                                                "en": "meaningful",
                                                                                                "vn": "ý nghĩa"
                                                },
                                                {
                                                                                                "en": "beneficial",
                                                                                                "vn": "có lợi"
                                                },
                                                {
                                                                                                "en": "entertaining",
                                                                                                "vn": "mang tính giải trí"
                                                },
                                                {
                                                                                                "en": "fascinating",
                                                                                                "vn": "lôi cuốn, hấp dẫn"
                                                }
]
                        },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": "2. What do you often do to [mục đích]?",
                        "formula": "→ I often <strong>[hoạt động 1 – Vo]</strong> to <strong>[mục đích]</strong> because it’s an effective way to <strong>[lợi ích 1]</strong>. I also try to <strong>[hoạt động 2 – Vo]</strong> because it allows me to <strong>[lợi ích 2]</strong>.",
                        "examples": [
                                {
                                        "q": "What do you often do to <span class='sub-hl'>keep in shape</span>?",
                                        "a": "→ I often exercise to keep in shape because it’s an effective way to burn calories. I also try to have a balanced diet because it allows me to control my weight.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>exercise</strong> to <strong>keep in shape</strong> because it’s an effective way to <strong>burn calories</strong>. I also try to <strong>have a balanced diet</strong> because it allows me to <strong>control my weight</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do to <span class='sub-hl'>stay healthy</span>?",
                                        "a": "→ I often run in the morning to stay healthy because it’s an effective way to strengthen my immune system. I also try to drink enough water because it allows me to maintain good physical health.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>run in the morning</strong> to <strong>stay healthy</strong> because it’s an effective way to <strong>strengthen my immune system</strong>. I also try to <strong>drink enough water</strong> because it allows me to <strong>maintain good physical health</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do to <span class='sub-hl'>improve your English skills</span>?",
                                        "a": "→ I often read English books to improve my English skills because it’s an effective way to enrich my vocabulary. I also try to practice speaking with friends because it allows me to build confidence.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>read English books</strong> to <strong>improve my English skills</strong> because it’s an effective way to <strong>enrich my vocabulary</strong>. I also try to <strong>practice speaking with friends</strong> because it allows me to <strong>build confidence</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do to <span class='sub-hl'>reduce stress</span>?",
                                        "a": "→ I often listen to acoustic music to reduce stress because it’s an effective way to calm my mind. I also try to take a short walk because it allows me to clear my head.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>listen to acoustic music</strong> to <strong>reduce stress</strong> because it’s an effective way to <strong>calm my mind</strong>. I also try to <strong>take a short walk</strong> because it allows me to <strong>clear my head</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do to <span class='sub-hl'>widen your knowledge</span>?",
                                        "a": "→ I often read non-fiction books to widen my knowledge because it’s an effective way to explore new fields. I also try to watch documentary videos because it allows me to gain practical insights.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>read non-fiction books</strong> to <strong>widen my knowledge</strong> because it’s an effective way to <strong>explore new fields</strong>. I also try to <strong>watch documentary videos</strong> because it allows me to <strong>gain practical insights</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do to <span class='sub-hl'>save money</span>?",
                                        "a": "→ I often cook at home to save money because it’s an effective way to cut down on dining expenses. I also try to plan my monthly budget because it allows me to control impulsive spending.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>cook at home</strong> to <strong>save money</strong> because it’s an effective way to <strong>cut down on dining expenses</strong>. I also try to <strong>plan my monthly budget</strong> because it allows me to <strong>control impulsive spending</strong>.</div>"
                                }
                        ],
                        "exQ": "What do you often do to <span class='sub-hl'>keep in shape</span>?",
                        "exA": "→ I often exercise to keep in shape because it’s an effective way to burn calories. I also try to have a balanced diet because it allows me to control my weight.",
                        "exAFormatted": "→ I often <span class=\"sub-hl\">exercise</span> to <span class=\"sub-hl\">keep in shape</span> because it’s an effective way to <span class=\"sub-hl\">burn calories</span>. I also try to <span class=\"sub-hl\">have a balanced diet</span> because it allows me to <span class=\"sub-hl\">control my weight</span>.",
                        "vocab": [
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích / Biện pháp:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": "3. What do you often do when [tình huống – mệnh đề]?",
                        "formula": "→ I usually <strong>[hoạt động – Vo]</strong> when <strong>[tình huống]</strong> because I find it a great way to <strong>[lợi ích 1]</strong>. It also allows me to <strong>[lợi ích 2]</strong>, so I can feel <strong>[tính từ cảm xúc]</strong>.",
                        "examples": [
                                {
                                        "q": "What do you often do when you <span class='sub-hl'>feel sad</span>?",
                                        "a": "→ I usually listen to music when I feel sad because I find it a great way to improve my mood. It also allows me to forget about my worries, so I can feel more positive.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>listen to music</strong> when I <strong>feel sad</strong> because I find it a great way to <strong>improve my mood</strong>. It also allows me to <strong>forget about my worries</strong>, so I can feel <strong>more positive</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do when you <span class='sub-hl'>feel stressed</span>?",
                                        "a": "→ I usually go for a walk when I feel stressed because I find it a great way to clear my mind. It also allows me to breathe fresh air, so I can feel more relaxed.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>go for a walk</strong> when I <strong>feel stressed</strong> because I find it a great way to <strong>clear my mind</strong>. It also allows me to <strong>breathe fresh air</strong>, so I can feel <strong>more relaxed</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do when you <span class='sub-hl'>are free</span>?",
                                        "a": "→ I usually read books when I am free because I find it a great way to widen my knowledge. It also allows me to develop my imagination, so I can feel inspired.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>read books</strong> when I <strong>am free</strong> because I find it a great way to <strong>widen my knowledge</strong>. It also allows me to <strong>develop my imagination</strong>, so I can feel <strong>inspired</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do when you <span class='sub-hl'>feel bored</span>?",
                                        "a": "→ I usually watch comedy movies when I feel bored because I find it a great way to have fun. It also allows me to pass the time, so I can feel refreshed.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>watch comedy movies</strong> when I <strong>feel bored</strong> because I find it a great way to <strong>have fun</strong>. It also allows me to <strong>pass the time</strong>, so I can feel <strong>refreshed</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do when you <span class='sub-hl'>are tired</span>?",
                                        "a": "→ I usually take a short nap when I am tired because I find it a great way to regain my energy. It also allows me to rest my eyes, so I can feel re-energized.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>take a short nap</strong> when I <strong>am tired</strong> because I find it a great way to <strong>regain my energy</strong>. It also allows me to <strong>rest my eyes</strong>, so I can feel <strong>re-energized</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do when you <span class='sub-hl'>feel anxious</span>?",
                                        "a": "→ I usually do deep breathing exercises when I feel anxious because I find it a great way to calm down. It also allows me to release mental tension, so I can feel much more peaceful.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>do deep breathing exercises</strong> when I <strong>feel anxious</strong> because I find it a great way to <strong>calm down</strong>. It also allows me to <strong>release mental tension</strong>, so I can feel <strong>much more peaceful</strong>.</div>"
                                }
                        ],
                        "exQ": "What do you often do when you <span class='sub-hl'>feel sad</span>?",
                        "exA": "→ I usually listen to music when I feel sad because I find it a great way to improve my mood. It also allows me to forget about my worries, so I can feel more positive.",
                        "exAFormatted": "→ I usually <span class=\"sub-hl\">listen to music</span> when I <span class=\"sub-hl\">feel sad</span> because I find it a great way to <span class=\"sub-hl\">improve my mood</span>. It also allows me to <span class=\"sub-hl\">forget about my worries</span>, so I can feel <span class=\"sub-hl\">more positive</span>.",
                        "vocab": [
                                {
                                "type": "emotion",
                                "title": "Tính từ mô tả cảm xúc:",
                                "items": [
                                                {
                                                                                                "en": "relaxed",
                                                                                                "vn": "thư thái"
                                                },
                                                {
                                                                                                "en": "refreshed",
                                                                                                "vn": "sảng khoái"
                                                },
                                                {
                                                                                                "en": "positive",
                                                                                                "vn": "tích cực"
                                                },
                                                {
                                                                                                "en": "energetic",
                                                                                                "vn": "tràn đầy năng lượng"
                                                },
                                                {
                                                                                                "en": "comfortable",
                                                                                                "vn": "dễ chịu"
                                                },
                                                {
                                                                                                "en": "calm",
                                                                                                "vn": "bình tĩnh, thanh thản"
                                                },
                                                {
                                                                                                "en": "productive",
                                                                                                "vn": "hiệu quả"
                                                },
                                                {
                                                                                                "en": "motivated",
                                                                                                "vn": "có động lực"
                                                },
                                                {
                                                                                                "en": "confident",
                                                                                                "vn": "tự tin"
                                                },
                                                {
                                                                                                "en": "satisfied",
                                                                                                "vn": "hài lòng"
                                                }
]
                        },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": "4. What kinds of [danh từ] do you like?",
                        "formula": "→ I’m a big fan of <strong>[2 thể loại]</strong> because I find them very <strong>[tính từ]</strong>. They allow me to <strong>[lợi ích 1]</strong> and give me a chance to <strong>[lợi ích 2]</strong>.",
                        "examples": [
                                {
                                        "q": "What kinds of <span class='sub-hl'>movies</span> do you like?",
                                        "a": "→ I’m a big fan of action and comedy movies because I find them very interesting. They allow me to relax after a busy day and enjoy my free time.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a big fan of <strong>action and comedy movies</strong> because I find them very <strong>interesting</strong>. They allow me to <strong>relax after a busy day</strong> and <strong>enjoy my free time</strong>.</div>"
                                },
                                {
                                        "q": "What kinds of <span class='sub-hl'>music</span> do you like?",
                                        "a": "→ I’m a big fan of pop and acoustic music because I find them very soothing. They allow me to improve my mood and give me a chance to clear my mind.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a big fan of <strong>pop and acoustic music</strong> because I find them very <strong>soothing</strong>. They allow me to <strong>improve my mood</strong> and give me a chance to <strong>clear my mind</strong>.</div>"
                                },
                                {
                                        "q": "What kinds of <span class='sub-hl'>books</span> do you like?",
                                        "a": "→ I’m a big fan of detective novels and self-help books because I find them very fascinating. They allow me to widen my knowledge and give me a chance to develop my critical thinking.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a big fan of <strong>detective novels and self-help books</strong> because I find them very <strong>fascinating</strong>. They allow me to <strong>widen my knowledge</strong> and give me a chance to <strong>develop my critical thinking</strong>.</div>"
                                },
                                {
                                        "q": "What kinds of <span class='sub-hl'>sports</span> do you like?",
                                        "a": "→ I’m a big fan of badminton and swimming because I find them very dynamic. They allow me to stay in good shape and give me a chance to boost my stamina.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a big fan of <strong>badminton and swimming</strong> because I find them very <strong>dynamic</strong>. They allow me to <strong>stay in good shape</strong> and give me a chance to <strong>boost my stamina</strong>.</div>"
                                },
                                {
                                        "q": "What kinds of <span class='sub-hl'>food</span> do you like?",
                                        "a": "→ I’m a big fan of traditional Vietnamese and Italian food because I find them both delicious and rich in flavor. They allow me to enjoy great meals and discover diverse culinary cultures.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a big fan of <strong>traditional Vietnamese and Italian food</strong> because I find them both <strong>delicious and rich in flavor</strong>. They allow me to <strong>enjoy great meals</strong> and <strong>discover diverse culinary cultures</strong>.</div>"
                                },
                                {
                                        "q": "What kinds of <span class='sub-hl'>hobbies</span> do you like?",
                                        "a": "→ I’m a big fan of photography and gardening because I find them very peaceful. They allow me to reconnect with nature and give me a chance to express my creative side.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a big fan of <strong>photography and gardening</strong> because I find them very <strong>peaceful</strong>. They allow me to <strong>reconnect with nature</strong> and give me a chance to <strong>express my creative side</strong>.</div>"
                                }
                        ],
                        "exQ": "What kinds of <span class='sub-hl'>movies</span> do you like?",
                        "exA": "→ I’m a big fan of action and comedy movies because I find them very interesting. They allow me to relax after a busy day and enjoy my free time.",
                        "exAFormatted": "→ I’m a big fan of <span class=\"sub-hl\">action and comedy movies</span> because I find them very <span class=\"sub-hl\">interesting</span>. They allow me to <span class=\"sub-hl\">relax after a busy day</span> and <span class=\"sub-hl\">enjoy my free time</span>.",
                        "vocab": [
                                {
                                "type": "adj",
                                "title": "Tính từ mô tả thể loại:",
                                "items": [
                                                {
                                                                                                "en": "interesting",
                                                                                                "vn": "thú vị"
                                                },
                                                {
                                                                                                "en": "exciting",
                                                                                                "vn": "hào hứng"
                                                },
                                                {
                                                                                                "en": "relaxing",
                                                                                                "vn": "thư giãn"
                                                },
                                                {
                                                                                                "en": "enjoyable",
                                                                                                "vn": "thoải mái, thú vị"
                                                },
                                                {
                                                                                                "en": "meaningful",
                                                                                                "vn": "ý nghĩa"
                                                },
                                                {
                                                                                                "en": "beneficial",
                                                                                                "vn": "có lợi"
                                                },
                                                {
                                                                                                "en": "entertaining",
                                                                                                "vn": "mang tính giải trí"
                                                },
                                                {
                                                                                                "en": "fascinating",
                                                                                                "vn": "lôi cuốn, hấp dẫn"
                                                }
]
                        },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": "5. What is your favorite [danh từ]?",
                        "formula": "→ One of my <strong>[danh từ số nhiều]</strong> is <strong>[thứ cụ thể]</strong> because I find it both <strong>[2 tính từ mô tả phù hợp]</strong>. It always makes me feel <strong>[tính từ mô tả cảm xúc]</strong> and helps me <strong>[lợi ích]</strong>.",
                        "examples": [
                                {
                                        "q": "What is your favorite <span class='sub-hl'>food</span>?",
                                        "a": "→ One of my favorite foods is Vietnamese pho because I find it both delicious and nutritious. It always makes me feel satisfied and helps me stay energized throughout the day.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → One of my favorite foods is <strong>Vietnamese pho</strong> because I find it both <strong>delicious and nutritious</strong>. It always makes me feel <strong>satisfied</strong> and helps me <strong>stay energized throughout the day</strong>.</div>"
                                },
                                {
                                        "q": "What is your favorite <span class='sub-hl'>movie</span>?",
                                        "a": "→ One of my favorite movies is Spider-Man because I find it both thrilling and inspiring. It always makes me feel excited and helps me relieve stress.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → One of my favorite movies is <strong>Spider-Man</strong> because I find it both <strong>thrilling and inspiring</strong>. It always makes me feel <strong>excited</strong> and helps me <strong>relieve stress</strong>.</div>"
                                },
                                {
                                        "q": "What is your favorite <span class='sub-hl'>color</span>?",
                                        "a": "→ One of my favorite colors is blue because I find it both peaceful and elegant. It always makes me feel calm and helps me stay focused.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → One of my favorite colors is <strong>blue</strong> because I find it both <strong>peaceful and elegant</strong>. It always makes me feel <strong>calm</strong> and helps me <strong>stay focused</strong>.</div>"
                                },
                                {
                                        "q": "What is your favorite <span class='sub-hl'>sport</span>?",
                                        "a": "→ One of my favorite sports is football because I find it both exciting and competitive. It always makes me feel energetic and helps me build teamwork skills.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → One of my favorite sports is <strong>football</strong> because I find it both <strong>exciting and competitive</strong>. It always makes me feel <strong>energetic</strong> and helps me <strong>build teamwork skills</strong>.</div>"
                                },
                                {
                                        "q": "What is your favorite <span class='sub-hl'>season</span>?",
                                        "a": "→ One of my favorite seasons is autumn because I find the weather both cool and pleasant. It always makes me feel romantic and helps me enjoy outdoor walks.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → One of my favorite seasons is <strong>autumn</strong> because I find the weather both <strong>cool and pleasant</strong>. It always makes me feel <strong>romantic</strong> and helps me <strong>enjoy outdoor walks</strong>.</div>"
                                },
                                {
                                        "q": "What is your favorite <span class='sub-hl'>subject</span>?",
                                        "a": "→ One of my favorite subjects is English because I find it both useful and engaging. It always makes me feel confident and helps me connect with international friends.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → One of my favorite subjects is <strong>English</strong> because I find it both <strong>useful and engaging</strong>. It always makes me feel <strong>confident</strong> and helps me <strong>connect with international friends</strong>.</div>"
                                }
                        ],
                        "exQ": "What is your favorite <span class='sub-hl'>food</span>?",
                        "exA": "→ One of my favorite foods is Vietnamese pho because I find it both delicious and nutritious. It always makes me feel satisfied and helps me stay energized throughout the day.",
                        "exAFormatted": "→ One of my favorite foods is <span class=\"sub-hl\">Vietnamese pho</span> because I find it both <span class=\"sub-hl\">delicious and nutritious</span>. It always makes me feel <span class=\"sub-hl\">satisfied</span> and helps me <span class=\"sub-hl\">stay energized throughout the day</span>.",
                        "vocab": [
                                {
                                "type": "emotion",
                                "title": "Tính từ mô tả cảm xúc:",
                                "items": [
                                                {
                                                                                                "en": "relaxed",
                                                                                                "vn": "thư thái"
                                                },
                                                {
                                                                                                "en": "refreshed",
                                                                                                "vn": "sảng khoái"
                                                },
                                                {
                                                                                                "en": "positive",
                                                                                                "vn": "tích cực"
                                                },
                                                {
                                                                                                "en": "energetic",
                                                                                                "vn": "tràn đầy năng lượng"
                                                },
                                                {
                                                                                                "en": "comfortable",
                                                                                                "vn": "dễ chịu"
                                                },
                                                {
                                                                                                "en": "calm",
                                                                                                "vn": "bình tĩnh, thanh thản"
                                                },
                                                {
                                                                                                "en": "productive",
                                                                                                "vn": "hiệu quả"
                                                },
                                                {
                                                                                                "en": "motivated",
                                                                                                "vn": "có động lực"
                                                },
                                                {
                                                                                                "en": "confident",
                                                                                                "vn": "tự tin"
                                                },
                                                {
                                                                                                "en": "satisfied",
                                                                                                "vn": "hài lòng"
                                                }
]
                        },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": "6. What are the benefits of [noun/noun phrase/Ving]?",
                        "formula": "→ <strong>[noun/noun phrase/Ving]</strong> <strong>bring(s)</strong> us a number of benefits. For example, <strong>it allows</strong> / <strong>they allow</strong> us to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>. Moreover, we can <strong>[lợi ích 3]</strong>.",
                        "note": "<strong>LƯU Ý VỀ SỐ ÍT &amp; SỐ NHIỀU:</strong><br>• <strong>Danh từ số ít / Danh từ không đếm được / V-ing</strong> (như <em>exercise, reading books, learning English...</em>) ➝ Dùng <strong>brings</strong> và <strong>it allows</strong>.<br>• <strong>Danh từ số nhiều</strong> (như <em>soft skills, extracurricular activities...</em>) ➝ Dùng <strong>bring</strong> và <strong>they allow</strong>.",
                        "examples": [
                                {
                                        "q": "What are the benefits of <span class='sub-hl'>exercise</span>?",
                                        "a": "→ Exercise brings us a number of benefits. For example, it allows us to stay healthy and reduce stress. Moreover, we can improve our physical fitness.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → <strong>Exercise</strong> brings us a number of benefits. For example, it allows us to <strong>stay healthy</strong> and <strong>reduce stress</strong>. Moreover, we can <strong>improve our physical fitness</strong>.</div>"
                                },
                                {
                                        "q": "What are the benefits of <span class='sub-hl'>reading books</span>?",
                                        "a": "→ Reading books brings us a number of benefits. For example, it allows us to broaden our knowledge and improve our vocabulary. Moreover, we can develop our imagination.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → <strong>Reading books</strong> brings us a number of benefits. For example, it allows us to <strong>broaden our knowledge</strong> and <strong>improve our vocabulary</strong>. Moreover, we can <strong>develop our imagination</strong>.</div>"
                                },
                                {
                                        "q": "What are the benefits of <span class='sub-hl'>using public transport</span>?",
                                        "a": "→ Using public transport brings us a number of benefits. For example, it allows us to save money and reduce traffic congestion. Moreover, we can protect the environment.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → <strong>Using public transport</strong> brings us a number of benefits. For example, it allows us to <strong>save money</strong> and <strong>reduce traffic congestion</strong>. Moreover, we can <strong>protect the environment</strong>.</div>"
                                },
                                {
                                        "q": "What are the benefits of <span class='sub-hl'>soft skills</span>?",
                                        "a": "→ Soft skills bring us a number of benefits. For example, they allow us to communicate effectively and resolve conflicts. Moreover, we can advance our career prospects.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → <strong>Soft skills</strong> bring us a number of benefits. For example, they allow us to <strong>communicate effectively</strong> and <strong>resolve conflicts</strong>. Moreover, we can <strong>advance our career prospects</strong>.</div>"
                                },
                                {
                                        "q": "What are the benefits of <span class='sub-hl'>learning a foreign language</span>?",
                                        "a": "→ Learning a foreign language brings us a number of benefits. For example, it allows us to communicate with global citizens and explore diverse cultures. Moreover, we can expand our employment opportunities.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → <strong>Learning a foreign language</strong> brings us a number of benefits. For example, it allows us to <strong>communicate with global citizens</strong> and <strong>explore diverse cultures</strong>. Moreover, we can <strong>expand our employment opportunities</strong>.</div>"
                                },
                                {
                                        "q": "What are the benefits of <span class='sub-hl'>teamwork</span>?",
                                        "a": "→ Teamwork brings us a number of benefits. For example, it allows us to share heavy workloads and brainstorm creative solutions. Moreover, we can build stronger interpersonal relationships.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → <strong>Teamwork</strong> brings us a number of benefits. For example, it allows us to <strong>share heavy workloads</strong> and <strong>brainstorm creative solutions</strong>. Moreover, we can <strong>build stronger interpersonal relationships</strong>.</div>"
                                }
                        ],
                        "exQ": "What are the benefits of <span class='sub-hl'>exercise</span>?",
                        "exA": "→ Exercise brings us a number of benefits. For example, it allows us to stay healthy and reduce stress. Moreover, we can improve our physical fitness.",
                        "exAFormatted": "→ <span class=\"sub-hl\">Exercise</span> brings us a number of benefits. For example, it allows us to <span class=\"sub-hl\">stay healthy</span> and <span class=\"sub-hl\">reduce stress</span>. Moreover, we can <span class=\"sub-hl\">improve our physical fitness</span>.",
                        "vocab": [
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích tổng hợp:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                }
        ],
        "who": [
                {
                        "title": "1. Who’s your favorite [noun – danh từ chỉ người]?",
                        "formula": "→ I’m a huge fan of <strong>[tên]</strong>. I admire <strong>him/her</strong> because <strong>[lý do chính]</strong>. Besides, <strong>he/she</strong> is very <strong>[2 tính từ mô tả tính cách]</strong>, which I find very impressive.",
                        "examples": [
                                {
                                        "q": "Who’s your favorite <span class='sub-hl'>singer</span>?",
                                        "a": "→ I’m a huge fan of Justin Bieber. I admire him because he has a beautiful voice. Besides, he is very talented and creative, which I find very impressive.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a huge fan of <strong>Justin Bieber</strong>. I admire him because <strong>he has a beautiful voice</strong>. Besides, he is very <strong>talented and creative</strong>, which I find very impressive.</div>"
                                },
                                {
                                        "q": "Who’s your favorite <span class='sub-hl'>actor</span>?",
                                        "a": "→ I’m a huge fan of Tom Hanks. I admire him because of his versatile acting skills. Besides, he is very humble and dedicated, which I find very impressive.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a huge fan of <strong>Tom Hanks</strong>. I admire him because of <strong>his versatile acting skills</strong>. Besides, he is very <strong>humble and dedicated</strong>, which I find very impressive.</div>"
                                },
                                {
                                        "q": "Who’s your favorite <span class='sub-hl'>teacher</span>?",
                                        "a": "→ I’m a huge fan of my high school English teacher. I admire her because she explains complex ideas clearly. Besides, she is very patient and supportive, which I find very impressive.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a huge fan of <strong>my high school English teacher</strong>. I admire her because <strong>she explains complex ideas clearly</strong>. Besides, she is very <strong>patient and supportive</strong>, which I find very impressive.</div>"
                                },
                                {
                                        "q": "Who’s your favorite <span class='sub-hl'>football player</span>?",
                                        "a": "→ I’m a huge fan of Lionel Messi. I admire him because of his unbelievable skills on the pitch. Besides, he is very modest and hardworking, which I find very impressive.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a huge fan of <strong>Lionel Messi</strong>. I admire him because of <strong>his unbelievable skills on the pitch</strong>. Besides, he is very <strong>modest and hardworking</strong>, which I find very impressive.</div>"
                                },
                                {
                                        "q": "Who’s your favorite <span class='sub-hl'>writer / author</span>?",
                                        "a": "→ I’m a huge fan of J.K. Rowling. I admire her because she creates captivating magical stories. Besides, she is extremely imaginative and passionate, which I find very impressive.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a huge fan of <strong>J.K. Rowling</strong>. I admire her because <strong>she creates captivating magical stories</strong>. Besides, she is extremely <strong>imaginative and passionate</strong>, which I find very impressive.</div>"
                                },
                                {
                                        "q": "Who’s your favorite <span class='sub-hl'>family member</span>?",
                                        "a": "→ I’m a huge fan of my mother. I admire her because she always takes wonderful care of our whole family. Besides, she is remarkably strong and caring, which I find very impressive.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m a huge fan of <strong>my mother</strong>. I admire her because <strong>she always takes wonderful care of our whole family</strong>. Besides, she is remarkably <strong>strong and caring</strong>, which I find very impressive.</div>"
                                }
                        ],
                        "exQ": "Who’s your favorite <span class='sub-hl'>singer</span>?",
                        "exA": "→ I’m a huge fan of Justin Bieber. I admire him because he has a beautiful voice. Besides, he is very talented and creative, which I find very impressive.",
                        "exAFormatted": "→ I’m a huge fan of <span class=\"sub-hl\">Justin Bieber</span>. I admire him because <span class=\"sub-hl\">he has a beautiful voice</span>. Besides, he is very <span class=\"sub-hl\">talented and creative</span>, which I find very impressive.",
                        "vocab": [
                                {
                                "type": "adj",
                                "title": "Tính từ mô tả phẩm chất / tính cách:",
                                "items": [
                                                {
                                                                                                "en": "talented",
                                                                                                "vn": "tài năng"
                                                },
                                                {
                                                                                                "en": "creative",
                                                                                                "vn": "sáng tạo"
                                                },
                                                {
                                                                                                "en": "passionate",
                                                                                                "vn": "đầy đam mê"
                                                },
                                                {
                                                                                                "en": "dedicated",
                                                                                                "vn": "tận tâm"
                                                },
                                                {
                                                                                                "en": "humble",
                                                                                                "vn": "khiêm tốn"
                                                },
                                                {
                                                                                                "en": "kind-hearted",
                                                                                                "vn": "nhân hậu"
                                                },
                                                {
                                                                                                "en": "patient",
                                                                                                "vn": "kiên nhẫn"
                                                },
                                                {
                                                                                                "en": "supportive",
                                                                                                "vn": "luôn ủng hộ"
                                                },
                                                {
                                                                                                "en": "inspiring",
                                                                                                "vn": "truyền cảm hứng"
                                                }
]
                        }
                        ]
                },
                {
                        "title": "2. Who do you often [hoạt động – Vo] with?",
                        "formula": "→ I often <strong>[hoạt động – Vo]</strong> with my <strong>[đối tượng phù hợp]</strong> because <strong>[lý do]</strong>. I find it more <strong>[tính từ phù hợp]</strong> when we can share the experience and spend quality time together.",
                        "examples": [
                                {
                                        "q": "Who do you often <span class='sub-hl'>go shopping</span> with?",
                                        "a": "→ I often go shopping with my sister because we have similar interests. I find it more enjoyable when we can help each other choose suitable things and share our opinions.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>go shopping</strong> with <strong>my sister</strong> because <strong>we have similar interests</strong>. I find it more <strong>enjoyable</strong> when we can help each other choose suitable things and share our opinions.</div>"
                                },
                                {
                                        "q": "Who do you often <span class='sub-hl'>study</span> with?",
                                        "a": "→ I often study with my close classmate because we can help each other solve difficult exercises. I find it more productive when we can share the experience and spend quality time together.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>study</strong> with <strong>my close classmate</strong> because <strong>we can help each other solve difficult exercises</strong>. I find it more <strong>productive</strong> when we can share the experience and spend quality time together.</div>"
                                },
                                {
                                        "q": "Who do you often <span class='sub-hl'>play sports</span> with?",
                                        "a": "→ I often play sports with my neighborhood friends because we share the same passion for badminton. I find it more exhilarating when we can motivate each other and spend quality time together.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>play sports</strong> with <strong>my neighborhood friends</strong> because <strong>we share the same passion for badminton</strong>. I find it more <strong>exhilarating</strong> when we can motivate each other and spend quality time together.</div>"
                                },
                                {
                                        "q": "Who do you often <span class='sub-hl'>go out</span> with?",
                                        "a": "→ I often go out with my best friends because they always make me laugh. I find it more relaxing when we can share our daily stories and spend quality time together.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>go out</strong> with <strong>my best friends</strong> because <strong>they always make me laugh</strong>. I find it more <strong>relaxing</strong> when we can share our daily stories and spend quality time together.</div>"
                                },
                                {
                                        "q": "Who do you often <span class='sub-hl'>travel</span> with?",
                                        "a": "→ I often travel with my family because we love spending holiday trips together. I find it more memorable when we can explore scenic destinations and strengthen family bonds.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>travel</strong> with <strong>my family</strong> because <strong>we love spending holiday trips together</strong>. I find it more <strong>memorable</strong> when we can explore scenic destinations and strengthen family bonds.</div>"
                                },
                                {
                                        "q": "Who do you often <span class='sub-hl'>cook</span> with?",
                                        "a": "→ I often cook with my mother at weekends because she teaches me traditional recipes. I find it more enjoyable when we can prepare delicious meals and chat happily.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>cook</strong> with <strong>my mother</strong> at weekends because <strong>she teaches me traditional recipes</strong>. I find it more <strong>enjoyable</strong> when we can prepare delicious meals and chat happily.</div>"
                                }
                        ],
                        "exQ": "Who do you often <span class='sub-hl'>go shopping</span> with?",
                        "exA": "→ I often go shopping with my sister because we have similar interests. I find it more enjoyable when we can help each other choose suitable things and share our opinions.",
                        "exAFormatted": "→ I often <span class=\"sub-hl\">go shopping</span> with <span class=\"sub-hl\">my sister</span> because <span class=\"sub-hl\">we have similar interests</span>. I find it more <span class=\"sub-hl\">enjoyable</span> when we can help each other choose suitable things and share our opinions.",
                        "vocab": [
                                {
                                "type": "adj",
                                "title": "Tính từ mô tả trải nghiệm cùng người khác:",
                                "items": [
                                                {
                                                                                                "en": "enjoyable",
                                                                                                "vn": "thú vị"
                                                },
                                                {
                                                                                                "en": "productive",
                                                                                                "vn": "hiệu quả"
                                                },
                                                {
                                                                                                "en": "relaxing",
                                                                                                "vn": "thư giãn"
                                                },
                                                {
                                                                                                "en": "memorable",
                                                                                                "vn": "đáng nhớ"
                                                },
                                                {
                                                                                                "en": "motivating",
                                                                                                "vn": "tạo động lực"
                                                }
]
                        }
                        ]
                }
        ],
        "when": [
                {
                        "title": "1. When do you often [hoạt động – Vo]?",
                        "formula": "→ I usually <strong>[hoạt động – Vo]</strong> <strong>[thời gian]</strong> because that’s when I have some free time. I find it a great opportunity to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>.",
                        "examples": [
                                {
                                        "q": "When do you often <span class='sub-hl'>listen to music</span>?",
                                        "a": "→ I often listen to music in the evening because that’s when I have some free time. I find it a great opportunity to relax after a busy day and reduce stress.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>listen to music</strong> <strong>in the evening</strong> because that’s when I have some free time. I find it a great opportunity to <strong>relax after a busy day</strong> and <strong>reduce stress</strong>.</div>"
                                },
                                {
                                        "q": "When do you often <span class='sub-hl'>read books</span>?",
                                        "a": "→ I usually read books before going to bed because that’s when I have some free time. I find it a great opportunity to clear my mind and widen my knowledge.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>read books</strong> <strong>before going to bed</strong> because that’s when I have some free time. I find it a great opportunity to <strong>clear my mind</strong> and <strong>widen my knowledge</strong>.</div>"
                                },
                                {
                                        "q": "When do you often <span class='sub-hl'>meet your friends</span>?",
                                        "a": "→ I usually meet my friends at weekends because that’s when I have some free time. I find it a great opportunity to catch up on each other’s lives and strengthen our friendships.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>meet my friends</strong> <strong>at weekends</strong> because that’s when I have some free time. I find it a great opportunity to <strong>catch up on each other’s lives</strong> and <strong>strengthen our friendships</strong>.</div>"
                                },
                                {
                                        "q": "When do you often <span class='sub-hl'>do your homework</span>?",
                                        "a": "→ I usually do my homework in the afternoon because that’s when I have some free time. I find it a great opportunity to review my lessons and complete assignments effectively.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>do my homework</strong> <strong>in the afternoon</strong> because that’s when I have some free time. I find it a great opportunity to <strong>review my lessons</strong> and <strong>complete assignments effectively</strong>.</div>"
                                },
                                {
                                        "q": "When do you often <span class='sub-hl'>exercise</span>?",
                                        "a": "→ I usually exercise in the early morning because that’s when I have high energy levels. I find it a great opportunity to boost my metabolism and start the day productively.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>exercise</strong> <strong>in the early morning</strong> because that’s when I have high energy levels. I find it a great opportunity to <strong>boost my metabolism</strong> and <strong>start the day productively</strong>.</div>"
                                },
                                {
                                        "q": "When do you often <span class='sub-hl'>go for a walk</span>?",
                                        "a": "→ I usually go for a walk in the late afternoon because that’s when the weather is cool. I find it a great opportunity to unwind and enjoy the sunset.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>go for a walk</strong> <strong>in the late afternoon</strong> because that’s when the weather is cool. I find it a great opportunity to <strong>unwind</strong> and <strong>enjoy the sunset</strong>.</div>"
                                }
                        ],
                        "exQ": "When do you often <span class='sub-hl'>listen to music</span>?",
                        "exA": "→ I often listen to music in the evening because that’s when I have some free time. I find it a great opportunity to relax after a busy day and reduce stress.",
                        "exAFormatted": "→ I often <span class=\"sub-hl\">listen to music</span> <span class=\"sub-hl\">in the evening</span> because that’s when I have some free time. I find it a great opportunity to <span class=\"sub-hl\">relax after a busy day</span> and <span class=\"sub-hl\">reduce stress</span>.",
                        "vocab": [
                                {
                                        "type": "time",
                                        "title": "Cụm Thời gian:",
                                        "items": [
                                                {
                                                        "en": "in the morning",
                                                        "vn": "vào buổi sáng"
                                                },
                                                {
                                                        "en": "in the afternoon",
                                                        "vn": "vào buổi chiều"
                                                },
                                                {
                                                        "en": "in the evening",
                                                        "vn": "vào buổi tối"
                                                },
                                                {
                                                        "en": "at night",
                                                        "vn": "vào ban đêm"
                                                },
                                                {
                                                        "en": "at weekends",
                                                        "vn": "vào cuối tuần"
                                                },
                                                {
                                                        "en": "on weekdays",
                                                        "vn": "vào các ngày trong tuần"
                                                },
                                                {
                                                        "en": "on my days off",
                                                        "vn": "vào những ngày nghỉ"
                                                },
                                                {
                                                        "en": "in my free time",
                                                        "vn": "vào thời gian rảnh rỗi"
                                                }
                                        ]
                                },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                }
        ],
        "where": [
                {
                        "title": "1. Where do you often [hoạt động – Vo]?",
                        "formula": "→ I usually <strong>[hoạt động – Vo]</strong> <strong>[cụm địa điểm]</strong> because I find it very <strong>[tính từ mô tả địa điểm]</strong>. It allows me to <strong>[lợi ích 1]</strong> and gives me a chance to <strong>[lợi ích 2]</strong>.",
                        "examples": [
                                {
                                        "q": "Where do you often <span class='sub-hl'>read books</span>?",
                                        "a": "→ I often read books in the school library because I find it very quiet. It allows me to focus better and gives me a chance to stay motivated.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I often <strong>read books</strong> <strong>in the school library</strong> because I find it very <strong>quiet</strong>. It allows me to <strong>focus better</strong> and gives me a chance to <strong>stay motivated</strong>.</div>"
                                },
                                {
                                        "q": "Where do you often <span class='sub-hl'>go shopping</span>?",
                                        "a": "→ I usually go shopping at the local supermarket because I find it very convenient. It allows me to find fresh groceries and gives me a chance to compare prices.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>go shopping</strong> <strong>at the local supermarket</strong> because I find it very <strong>convenient</strong>. It allows me to <strong>find fresh groceries</strong> and gives me a chance to <strong>compare prices</strong>.</div>"
                                },
                                {
                                        "q": "Where do you often <span class='sub-hl'>exercise</span>?",
                                        "a": "→ I usually exercise in the central park because I find it very spacious and airy. It allows me to stay in good shape and gives me a chance to enjoy fresh air.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>exercise</strong> <strong>in the central park</strong> because I find it very <strong>spacious and airy</strong>. It allows me to <strong>stay in good shape</strong> and <strong>gives me a chance to enjoy fresh air</strong>.</div>"
                                },
                                {
                                        "q": "Where do you often <span class='sub-hl'>hang out with your friends</span>?",
                                        "a": "→ I usually hang out with my friends at cozy coffee shops because I find them very comfortable. It allows me to unwind and gives me a chance to chat without loud noise.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>hang out with my friends</strong> <strong>at cozy coffee shops</strong> because I find them very <strong>comfortable</strong>. It allows me to <strong>unwind</strong> and gives me a chance to <strong>chat without loud noise</strong>.</div>"
                                },
                                {
                                        "q": "Where do you often <span class='sub-hl'>study English</span>?",
                                        "a": "→ I usually study English in my own bedroom because I find it very peaceful. It allows me to avoid all distractions and gives me a chance to concentrate on practicing pronunciation.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>study English</strong> <strong>in my own bedroom</strong> because I find it very <strong>peaceful</strong>. It allows me to <strong>avoid all distractions</strong> and gives me a chance to <strong>concentrate on practicing pronunciation</strong>.</div>"
                                },
                                {
                                        "q": "Where do you often <span class='sub-hl'>relax</span>?",
                                        "a": "→ I usually relax on the balcony of my house because I find it breezy and soothing. It allows me to drink tea and gives me a chance to watch the city view.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>relax</strong> <strong>on the balcony of my house</strong> because I find it <strong>breezy and soothing</strong>. It allows me to <strong>drink tea</strong> and gives me a chance to <strong>watch the city view</strong>.</div>"
                                }
                        ],
                        "exQ": "Where do you often <span class='sub-hl'>read books</span>?",
                        "exA": "→ I often read books in the school library because I find it very quiet. It allows me to focus better and gives me a chance to stay motivated.",
                        "exAFormatted": "→ I often <span class=\"sub-hl\">read books</span> <span class=\"sub-hl\">in the school library</span> because I find it very <span class=\"sub-hl\">quiet</span>. It allows me to <span class=\"sub-hl\">focus better</span> and gives me a chance to <span class=\"sub-hl\">stay motivated</span>.",
                        "vocab": [
                                {
                                        "type": "place",
                                        "title": "Cụm Địa điểm phổ biến:",
                                        "items": [
                                                {
                                                        "en": "in the school library",
                                                        "vn": "ở thư viện trường"
                                                },
                                                {
                                                        "en": "at a local coffee shop",
                                                        "vn": "ở quán cà phê gần nhà"
                                                },
                                                {
                                                        "en": "in the central park",
                                                        "vn": "ở công viên trung tâm"
                                                },
                                                {
                                                        "en": "at the gym",
                                                        "vn": "ở phòng tập thể hình"
                                                },
                                                {
                                                        "en": "at the local supermarket",
                                                        "vn": "ở siêu thị địa phương"
                                                },
                                                {
                                                        "en": "in my bedroom",
                                                        "vn": "trong phòng ngủ của tôi"
                                                }
                                        ]
                                },
                                {
                                "type": "adj",
                                "title": "Tính từ mô tả không gian:",
                                "items": [
                                                {
                                                                                                "en": "peaceful",
                                                                                                "vn": "yên bình"
                                                },
                                                {
                                                                                                "en": "quiet",
                                                                                                "vn": "yên tĩnh"
                                                },
                                                {
                                                                                                "en": "cozy",
                                                                                                "vn": "ấm cúng"
                                                },
                                                {
                                                                                                "en": "comfortable",
                                                                                                "vn": "dễ chịu"
                                                },
                                                {
                                                                                                "en": "modern",
                                                                                                "vn": "hiện đại"
                                                },
                                                {
                                                                                                "en": "convenient",
                                                                                                "vn": "tiện lợi"
                                                },
                                                {
                                                                                                "en": "spacious",
                                                                                                "vn": "rộng rãi"
                                                },
                                                {
                                                                                                "en": "airy",
                                                                                                "vn": "thoáng mát"
                                                }
]
                        }
                        ]
                }
        ],
        "why": [
                {
                        "title": "1. Why do you like [hoạt động – Ving]?",
                        "formula": "→ I’m really into <strong>[hoạt động – Ving]</strong> because I find it very <strong>[tính từ mô tả hoạt động]</strong>. It allows me to <strong>[lợi ích 1]</strong> and gives me a chance to <strong>[lợi ích 2]</strong>.",
                        "examples": [
                                {
                                        "q": "Why do you like <span class='sub-hl'>swimming</span>?",
                                        "a": "→ I’m really into swimming because I find it very interesting. It allows me to stay healthy and gives me a chance to clear my mind.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m really into <strong>swimming</strong> because I find it <strong>very interesting</strong>. It allows me to <strong>stay healthy</strong> and gives me a chance to <strong>clear my mind</strong>.</div>"
                                },
                                {
                                        "q": "Why do you like <span class='sub-hl'>listening to music</span>?",
                                        "a": "→ I’m really into listening to music because I find it very relaxing. It allows me to improve my mood and gives me a chance to relieve mental pressure.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m really into <strong>listening to music</strong> because I find it <strong>very relaxing</strong>. It allows me to <strong>improve my mood</strong> and gives me a chance to <strong>relieve mental pressure</strong>.</div>"
                                },
                                {
                                        "q": "Why do you like <span class='sub-hl'>reading books</span>?",
                                        "a": "→ I’m really into reading books because I find it very inspiring. It allows me to broaden my horizons and gives me a chance to enhance my imagination.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m really into <strong>reading books</strong> because I find it <strong>very inspiring</strong>. It allows me to <strong>broaden my horizons</strong> and gives me a chance to <strong>enhance my imagination</strong>.</div>"
                                },
                                {
                                        "q": "Why do you like <span class='sub-hl'>playing sports</span>?",
                                        "a": "→ I’m really into playing sports because I find it very beneficial. It allows me to maintain good health and gives me a chance to build endurance.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m really into <strong>playing sports</strong> because I find it <strong>very beneficial</strong>. It allows me to <strong>maintain good health</strong> and gives me a chance to <strong>build endurance</strong>.</div>"
                                },
                                {
                                        "q": "Why do you like <span class='sub-hl'>learning English</span>?",
                                        "a": "→ I’m really into learning English because I find it very useful. It allows me to communicate with people globally and gives me a chance to explore better career opportunities.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m really into <strong>learning English</strong> because I find it <strong>very useful</strong>. It allows me to <strong>communicate with people globally</strong> and gives me a chance to <strong>explore better career opportunities</strong>.</div>"
                                },
                                {
                                        "q": "Why do you like <span class='sub-hl'>traveling</span>?",
                                        "a": "→ I’m really into traveling because I find it extremely exciting. It allows me to visit scenic places and gives me a chance to enrich my practical life experience.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m really into <strong>traveling</strong> because I find it <strong>extremely exciting</strong>. It allows me to <strong>visit scenic places</strong> and gives me a chance to <strong>enrich my practical life experience</strong>.</div>"
                                }
                        ],
                        "exQ": "Why do you like <span class='sub-hl'>swimming</span>?",
                        "exA": "→ I’m really into swimming because I find it very interesting. It allows me to stay healthy and gives me a chance to clear my mind.",
                        "exAFormatted": "→ I’m really into <span class=\"sub-hl\">swimming</span> because I find it very <span class=\"sub-hl\">interesting</span>. It allows me to <span class=\"sub-hl\">stay healthy</span> and gives me a chance to <span class=\"sub-hl\">clear my mind</span>.",
                        "vocab": [
                                {
                                "type": "adj",
                                "title": "Tính từ mô tả hoạt động:",
                                "items": [
                                                {
                                                                                                "en": "interesting",
                                                                                                "vn": "thú vị"
                                                },
                                                {
                                                                                                "en": "exciting",
                                                                                                "vn": "hào hứng"
                                                },
                                                {
                                                                                                "en": "relaxing",
                                                                                                "vn": "thư giãn"
                                                },
                                                {
                                                                                                "en": "enjoyable",
                                                                                                "vn": "thoải mái, thú vị"
                                                },
                                                {
                                                                                                "en": "meaningful",
                                                                                                "vn": "ý nghĩa"
                                                },
                                                {
                                                                                                "en": "beneficial",
                                                                                                "vn": "có lợi"
                                                },
                                                {
                                                                                                "en": "entertaining",
                                                                                                "vn": "mang tính giải trí"
                                                },
                                                {
                                                                                                "en": "fascinating",
                                                                                                "vn": "lôi cuốn, hấp dẫn"
                                                }
]
                        },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                }
        ],
        "how": [
                {
                        "title": "1. How do you [go/get/commute/travel] to [địa điểm]?",
                        "formula": "→ I usually <strong>[go/get/commute/travel]</strong> there by <strong>[phương tiện]</strong>, as it’s very <strong>[2 tính từ mô tả phương tiện]</strong>. That way, I can <strong>[2 lợi ích]</strong>.",
                        "examples": [
                                {
                                        "q": "How do you go to school <span class='sub-hl'>every day</span>?",
                                        "a": "→ I usually go to school by motorbike, as it’s very fast and convenient. That way, I can avoid traffic jams and save a lot of time.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually go to school by <strong>motorbike</strong>, as it’s very <strong>fast and convenient</strong>. That way, I can <strong>avoid traffic jams</strong> and <strong>save a lot of time</strong>.</div>"
                                },
                                {
                                        "q": "How do you <span class='sub-hl'>travel to work</span>?",
                                        "a": "→ I usually travel to work by bus, as it’s very economical and safe. That way, I can save money and reduce carbon emissions.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually travel to work by <strong>bus</strong>, as it’s very <strong>economical and safe</strong>. That way, I can <strong>save money</strong> and <strong>reduce carbon emissions</strong>.</div>"
                                },
                                {
                                        "q": "How do you <span class='sub-hl'>commute to university</span>?",
                                        "a": "→ I usually commute to university by electric bike, as it’s very flexible and eco-friendly. That way, I can get to class on time and protect the environment.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually commute to university by <strong>electric bike</strong>, as it’s very <strong>flexible and eco-friendly</strong>. That way, I can <strong>get to class on time</strong> and <strong>protect the environment</strong>.</div>"
                                },
                                {
                                        "q": "How do you <span class='sub-hl'>go to the supermarket</span>?",
                                        "a": "→ I usually go to the supermarket on foot, as it’s very healthy and relaxing. That way, I can get some light exercise and enjoy the fresh air.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually go to the supermarket <strong>on foot</strong>, as it’s very <strong>healthy and relaxing</strong>. That way, I can <strong>get some light exercise</strong> and <strong>enjoy the fresh air</strong>.</div>"
                                },
                                {
                                        "q": "How do you <span class='sub-hl'>travel to other cities</span>?",
                                        "a": "→ I usually travel to other cities by train, as it’s very comfortable and scenic. That way, I can rest during the journey and enjoy beautiful landscapes along the way.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually travel to other cities by <strong>train</strong>, as it’s very <strong>comfortable and scenic</strong>. That way, I can <strong>rest during the journey</strong> and <strong>enjoy beautiful landscapes along the way</strong>.</div>"
                                },
                                {
                                        "q": "How do you <span class='sub-hl'>go around your neighborhood</span>?",
                                        "a": "→ I usually ride a bicycle around my neighborhood, as it’s very agile and fun. That way, I can avoid parking hassles and get some physical exercise.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually ride a <strong>bicycle</strong> around my neighborhood, as it’s very <strong>agile and fun</strong>. That way, I can <strong>avoid parking hassles</strong> and <strong>get some physical exercise</strong>.</div>"
                                }
                        ],
                        "exQ": "How do you go to school <span class='sub-hl'>every day</span>?",
                        "exA": "→ I usually go to school by motorbike, as it’s very fast and convenient. That way, I can avoid traffic jams and save a lot of time.",
                        "exAFormatted": "→ I usually go to school by <span class=\"sub-hl\">motorbike</span>, as it’s very <span class=\"sub-hl\">fast and convenient</span>. That way, I can <span class=\"sub-hl\">avoid traffic jams</span> and <span class=\"sub-hl\">save a lot of time</span>.",
                        "vocab": [
                                {
                                        "type": "transport",
                                        "title": "Phương tiện giao thông:",
                                        "items": [
                                                {
                                                        "en": "by motorbike",
                                                        "vn": "bằng xe máy"
                                                },
                                                {
                                                        "en": "by bus",
                                                        "vn": "bằng xe buýt"
                                                },
                                                {
                                                        "en": "by electric bike",
                                                        "vn": "bằng xe đạp điện"
                                                },
                                                {
                                                "en": "by car",
                                                "vn": "bằng ô tô"
                                        },
                                        {
                                                "en": "by taxi",
                                                "vn": "bằng taxi"
                                        },
                                                {
                                                        "en": "on foot",
                                                        "vn": "đi bộ"
                                                }
                                        ]
                                },
                                {
                                "type": "adj",
                                "title": "Tính từ mô tả phương tiện:",
                                "items": [
                                                {
                                                                                                "en": "fast",
                                                                                                "vn": "nhanh chóng"
                                                },
                                                {
                                                                                                "en": "convenient",
                                                                                                "vn": "tiện lợi"
                                                },
                                                {
                                                                                                "en": "economical",
                                                                                                "vn": "tiết kiệm"
                                                },
                                                {
                                                                                                "en": "safe",
                                                                                                "vn": "an toàn"
                                                },
                                                {
                                                                                                "en": "flexible",
                                                                                                "vn": "linh hoạt"
                                                },
                                                {
                                                                                                "en": "eco-friendly",
                                                                                                "vn": "thân thiện với môi trường"
                                                },
                                                {
                                                                                                "en": "healthy",
                                                                                                "vn": "lành mạnh"
                                                },
                                                {
                                                                                                "en": "relaxing",
                                                                                                "vn": "thư giãn"
                                                }
]
                        }
                        ]
                },
                {
                        "title": "2. How often do you [hoạt động – Vo]?",
                        "formula": "→ Although I have a busy schedule, I still try to <strong>[hoạt động – Vo]</strong> <strong>[tần suất]</strong> because it allows me to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>. Moreover, it makes me feel <strong>[tính từ cảm xúc]</strong>.",
                        "examples": [
                                {
                                        "q": "How often do you go to the library <span class='sub-hl'>every week</span>?",
                                        "a": "→ Although I have a busy schedule, I still try to go to the library twice a week because it allows me to focus better and study more effectively. Moreover, it makes me feel more productive.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still try to <strong>go to the library</strong> <strong>twice a week</strong> because it allows me to <strong>focus better</strong> and <strong>study more effectively</strong>. Moreover, it makes me feel <strong>more productive</strong>.</div>"
                                },
                                {
                                        "q": "How often do you <span class='sub-hl'>exercise</span>?",
                                        "a": "→ Although I have a busy schedule, I still try to exercise every morning because it allows me to stay in good shape and boost my stamina. Moreover, it makes me feel energetic throughout the day.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still try to <strong>exercise</strong> <strong>every morning</strong> because it allows me to <strong>stay in good shape</strong> and <strong>boost my stamina</strong>. Moreover, it makes me feel <strong>energetic throughout the day</strong>.</div>"
                                },
                                {
                                        "q": "How often do you <span class='sub-hl'>read books</span>?",
                                        "a": "→ Although I have a busy schedule, I still try to read books every night because it allows me to widen my knowledge and clear my mind. Moreover, it makes me feel peaceful before sleep.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still try to <strong>read books</strong> <strong>every night</strong> because it allows me to <strong>widen my knowledge</strong> and <strong>clear my mind</strong>. Moreover, it makes me feel <strong>peaceful before sleep</strong>.</div>"
                                },
                                {
                                        "q": "How often do you <span class='sub-hl'>go shopping</span>?",
                                        "a": "→ Although I have a busy schedule, I still try to go shopping on weekends because it allows me to buy daily essentials and relax after work. Moreover, it makes me feel cheerful.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still try to <strong>go shopping</strong> <strong>on weekends</strong> because it allows me to <strong>buy daily essentials</strong> and <strong>relax after work</strong>. Moreover, it makes me feel <strong>cheerful</strong>.</div>"
                                },
                                {
                                        "q": "How often do you <span class='sub-hl'>watch movies</span>?",
                                        "a": "→ Although I have a busy schedule, I still try to watch movies on Sunday evenings because it allows me to enjoy my free time and unwind. Moreover, it makes me feel refreshed for the new week.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still try to <strong>watch movies</strong> <strong>on Sunday evenings</strong> because it allows me to <strong>enjoy my free time</strong> and <strong>unwind</strong>. Moreover, it makes me feel <strong>refreshed for the new week</strong>.</div>"
                                },
                                {
                                        "q": "How often do you <span class='sub-hl'>hang out with your friends</span>?",
                                        "a": "→ Although I have a busy schedule, I still try to hang out with my friends once a week because it allows me to maintain close connections and laugh together. Moreover, it makes me feel happier.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still try to <strong>hang out with my friends</strong> <strong>once a week</strong> because it allows me to <strong>maintain close connections</strong> and <strong>laugh together</strong>. Moreover, it makes me feel <strong>happier</strong>.</div>"
                                }
                        ],
                        "exQ": "How often do you go to the library <span class='sub-hl'>every week</span>?",
                        "exA": "→ Although I have a busy schedule, I still try to go to the library twice a week because it allows me to focus better and study more effectively. Moreover, it makes me feel more productive.",
                        "exAFormatted": "→ Although I have a busy schedule, I still try to <span class=\"sub-hl\">go to the library</span> <span class=\"sub-hl\">twice a week</span> because it allows me to <span class=\"sub-hl\">focus better</span> and <span class=\"sub-hl\">study more effectively</span>. Moreover, it makes me feel <span class=\"sub-hl\">more productive</span>.",
                        "vocab": [
                                {
                                        "type": "frequency",
                                        "title": "Cụm Tần suất:",
                                        "items": [
                                                {
                                                        "en": "every day",
                                                        "vn": "mỗi ngày"
                                                },
                                                {
                                                        "en": "twice a week",
                                                        "vn": "hai lần một tuần"
                                                },
                                                {
                                                        "en": "three times a week",
                                                        "vn": "ba lần một tuần"
                                                },
                                                {
                                                        "en": "on weekends",
                                                        "vn": "vào các ngày cuối tuần"
                                                },
                                                {
                                                        "en": "every morning",
                                                        "vn": "mỗi buổi sáng"
                                                },
                                                {
                                                        "en": "once in a while",
                                                        "vn": "thỉnh thoảng"
                                                }
                                        ]
                                },
                                {
                                "type": "emotion",
                                "title": "Tính từ mô tả cảm xúc:",
                                "items": [
                                                {
                                                                                                "en": "relaxed",
                                                                                                "vn": "thư thái"
                                                },
                                                {
                                                                                                "en": "refreshed",
                                                                                                "vn": "sảng khoái"
                                                },
                                                {
                                                                                                "en": "positive",
                                                                                                "vn": "tích cực"
                                                },
                                                {
                                                                                                "en": "energetic",
                                                                                                "vn": "tràn đầy năng lượng"
                                                },
                                                {
                                                                                                "en": "comfortable",
                                                                                                "vn": "dễ chịu"
                                                },
                                                {
                                                                                                "en": "calm",
                                                                                                "vn": "bình tĩnh, thanh thản"
                                                },
                                                {
                                                                                                "en": "productive",
                                                                                                "vn": "hiệu quả"
                                                },
                                                {
                                                                                                "en": "motivated",
                                                                                                "vn": "có động lực"
                                                },
                                                {
                                                                                                "en": "confident",
                                                                                                "vn": "tự tin"
                                                },
                                                {
                                                                                                "en": "satisfied",
                                                                                                "vn": "hài lòng"
                                                }
]
                        },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": "3. How much time do you spend [hoạt động – Ving]?",
                        "formula": "→ Although I have a busy schedule, I still spend about <strong>[lượng thời gian]</strong> <strong>[hoạt động – Ving]</strong> every day because it allows me to <strong>[lợi ích 1]</strong> and <strong>[lợi ích 2]</strong>. Moreover, it makes me feel more <strong>[tính từ cảm xúc]</strong>.",
                        "examples": [
                                {
                                        "q": "How much time do you spend <span class='sub-hl'>studying English</span>?",
                                        "a": "→ Although I have a busy schedule, I still spend about two hours studying English every day because it allows me to enrich my vocabulary and improve my pronunciation. It also makes me feel more confident.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still spend about <strong>two hours</strong> <strong>studying English</strong> every day because it allows me to <strong>enrich my vocabulary</strong> and <strong>improve my pronunciation</strong>. It also makes me feel <strong>more confident</strong>.</div>"
                                },
                                {
                                        "q": "How much time do you spend <span class='sub-hl'>reading books</span>?",
                                        "a": "→ Although I have a busy schedule, I still spend about thirty minutes reading books every day because it allows me to expand my knowledge and relax my mind. Moreover, it makes me feel more knowledgeable.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still spend about <strong>thirty minutes</strong> <strong>reading books</strong> every day because it allows me to <strong>expand my knowledge</strong> and <strong>relax my mind</strong>. Moreover, it makes me feel <strong>more knowledgeable</strong>.</div>"
                                },
                                {
                                        "q": "How much time do you spend <span class='sub-hl'>using social media</span>?",
                                        "a": "→ Although I have a busy schedule, I still spend about one hour using social media every day because it allows me to stay updated on current news and connect with friends. Moreover, it makes me feel more connected.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still spend about <strong>one hour</strong> <strong>using social media</strong> every day because it allows me to <strong>stay updated on current news</strong> and <strong>connect with friends</strong>. Moreover, it makes me feel <strong>more connected</strong>.</div>"
                                },
                                {
                                        "q": "How much time do you spend <span class='sub-hl'>exercising</span>?",
                                        "a": "→ Although I have a busy schedule, I still spend about forty-five minutes exercising every day because it allows me to stay healthy and burn excess calories. Moreover, it makes me feel more energized.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still spend about <strong>forty-five minutes</strong> <strong>exercising</strong> every day because it allows me to <strong>stay healthy</strong> and <strong>burn excess calories</strong>. Moreover, it makes me feel <strong>more energized</strong>.</div>"
                                },
                                {
                                        "q": "How much time do you spend <span class='sub-hl'>sleeping</span>?",
                                        "a": "→ Although I have a busy schedule, I still try to spend about seven to eight hours sleeping every day because it allows my body to recover and clear my mind. Moreover, it makes me feel well-rested.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still try to spend about <strong>seven to eight hours</strong> <strong>sleeping</strong> every day because it allows my body to <strong>recover</strong> and <strong>clear my mind</strong>. Moreover, it makes me feel <strong>well-rested</strong>.</div>"
                                },
                                {
                                        "q": "How much time do you spend <span class='sub-hl'>doing homework</span>?",
                                        "a": "→ Although I have a busy schedule, I still spend about an hour and a half doing homework every day because it allows me to review class lessons and prepare for exams. Moreover, it makes me feel more prepared.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → Although I have a busy schedule, I still spend about <strong>an hour and a half</strong> <strong>doing homework</strong> every day because it allows me to <strong>review class lessons</strong> and <strong>prepare for exams</strong>. Moreover, it makes me feel <strong>more prepared</strong>.</div>"
                                }
                        ],
                        "exQ": "How much time do you spend <span class='sub-hl'>studying English</span>?",
                        "exA": "→ Although I have a busy schedule, I still spend about two hours studying English every day because it allows me to enrich my vocabulary and improve my pronunciation. It also makes me feel more confident.",
                        "exAFormatted": "→ Although I have a busy schedule, I still spend about <span class=\"sub-hl\">two hours</span> <span class=\"sub-hl\">studying English</span> every day because it allows me to <span class=\"sub-hl\">enrich my vocabulary</span> and <span class=\"sub-hl\">improve my pronunciation</span>. It also makes me feel <span class=\"sub-hl\">more confident</span>.",
                        "vocab": [
                                {
                                        "type": "duration",
                                        "title": "Cụm Thời lượng:",
                                        "items": [
                                                {
                                                        "en": "about thirty minutes",
                                                        "vn": "khoảng 30 phút"
                                                },
                                                {
                                                        "en": "about one hour",
                                                        "vn": "khoảng 1 tiếng"
                                                },
                                                {
                                                        "en": "about two hours",
                                                        "vn": "khoảng 2 tiếng"
                                                },
                                                {
                                                        "en": "forty-five minutes",
                                                        "vn": "45 phút"
                                                },
                                                {
                                                        "en": "around an hour and a half",
                                                        "vn": "khoảng 1 tiếng rưỡi"
                                                }
                                        ]
                                },
                                {
                                "type": "emotion",
                                "title": "Tính từ mô tả cảm xúc:",
                                "items": [
                                                {
                                                                                                "en": "relaxed",
                                                                                                "vn": "thư thái"
                                                },
                                                {
                                                                                                "en": "refreshed",
                                                                                                "vn": "sảng khoái"
                                                },
                                                {
                                                                                                "en": "positive",
                                                                                                "vn": "tích cực"
                                                },
                                                {
                                                                                                "en": "energetic",
                                                                                                "vn": "tràn đầy năng lượng"
                                                },
                                                {
                                                                                                "en": "comfortable",
                                                                                                "vn": "dễ chịu"
                                                },
                                                {
                                                                                                "en": "calm",
                                                                                                "vn": "bình tĩnh, thanh thản"
                                                },
                                                {
                                                                                                "en": "productive",
                                                                                                "vn": "hiệu quả"
                                                },
                                                {
                                                                                                "en": "motivated",
                                                                                                "vn": "có động lực"
                                                },
                                                {
                                                                                                "en": "confident",
                                                                                                "vn": "tự tin"
                                                },
                                                {
                                                                                                "en": "satisfied",
                                                                                                "vn": "hài lòng"
                                                }
]
                        },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        "title": "4. How much money do you spend on [thứ gì đó – noun] every month?",
                        "formula": "→ I’m still a student, so I try to keep my spending under control. I often spend about <strong>[số tiền]</strong> on <strong>[thứ gì đó]</strong> every month. It allows me to <strong>[lợi ích]</strong> while still saving some money.",
                        "examples": [
                                {
                                        "q": "How much money do you spend on <span class='sub-hl'>clothes</span> every month?",
                                        "a": "→ I’m still a student, so I try to keep my spending under control. I only spend about $50 on clothes every month. It allows me to buy the clothes I need while still saving some money.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m still a student, so I try to keep my spending under control. I only spend about <strong>$50</strong> on <strong>clothes</strong> every month. It allows me to <strong>buy the clothes I need</strong> while still saving some money.</div>"
                                },
                                {
                                        "q": "How much money do you spend on <span class='sub-hl'>books</span> every month?",
                                        "a": "→ I’m still a student, so I try to keep my spending under control. I only spend about 200,000 VND on books every month. It allows me to purchase useful learning materials while still saving some money.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m still a student, so I try to keep my spending under control. I only spend about <strong>200,000 VND</strong> on <strong>books</strong> every month. It allows me to <strong>purchase useful learning materials</strong> while still saving some money.</div>"
                                },
                                {
                                        "q": "How much money do you spend on <span class='sub-hl'>food</span> every month?",
                                        "a": "→ I’m still a student, so I try to keep my spending under control. I often spend about two million VND on food every month. It allows me to eat nutritious meals while still saving some money.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m still a student, so I try to keep my spending under control. I often spend about <strong>two million VND</strong> on <strong>food</strong> every month. It allows me to <strong>eat nutritious meals</strong> while still saving some money.</div>"
                                },
                                {
                                        "q": "How much money do you spend on <span class='sub-hl'>entertainment</span> every month?",
                                        "a": "→ I’m still a student, so I try to keep my spending under control. I usually spend around 300,000 VND on entertainment every month. It allows me to hang out with friends occasionally while still saving some money.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m still a student, so I try to keep my spending under control. I usually spend around <strong>300,000 VND</strong> on <strong>entertainment</strong> every month. It allows me to <strong>hang out with friends occasionally</strong> while still saving some money.</div>"
                                },
                                {
                                        "q": "How much money do you spend on <span class='sub-hl'>transportation / petrol</span> every month?",
                                        "a": "→ I’m still a student, so I try to keep my spending under control. I usually spend about 200,000 VND on petrol every month. It allows me to commute to school and work while still saving some money.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m still a student, so I try to keep my spending under control. I usually spend about <strong>200,000 VND</strong> on <strong>petrol</strong> every month. It allows me to <strong>commute to school and work</strong> while still saving some money.</div>"
                                },
                                {
                                        "q": "How much money do you spend on <span class='sub-hl'>hobbies</span> every month?",
                                        "a": "→ I’m still a student, so I try to keep my spending under control. I spend around 400,000 VND on my hobbies every month. It allows me to buy sports gear and painting supplies while still saving some money.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I’m still a student, so I try to keep my spending under control. I spend around <strong>400,000 VND</strong> on my <strong>hobbies</strong> every month. It allows me to <strong>buy sports gear and painting supplies</strong> while still saving some money.</div>"
                                }
                        ],
                        "exQ": "How much money do you spend on <span class='sub-hl'>clothes</span> every month?",
                        "exA": "→ I’m still a student, so I try to keep my spending under control. I only spend about $50 on clothes every month. It allows me to buy the clothes I need while still saving some money.",
                        "exAFormatted": "→ I’m still a student, so I try to keep my spending under control. I only spend about <span class=\"sub-hl\">$50</span> on <span class=\"sub-hl\">clothes</span> every month. It allows me to <span class=\"sub-hl\">buy the clothes I need</span> while still saving some money.",
                        "vocab": [
                                {
                                        "type": "money",
                                        "title": "Cụm Số tiền tham khảo:",
                                        "items": [
                                                {
                                                "en": "about $50",
                                                "vn": "khoảng 50 đô"
                                        },
                                        {
                                                "en": "about 1 million VND",
                                                "vn": "khoảng 1 triệu VNĐ"
                                        },
                                                {
                                                        "en": "200,000 VND",
                                                        "vn": "200.000 VNĐ"
                                                },
                                                {
                                                        "en": "two million VND",
                                                        "vn": "2 triệu VNĐ"
                                                },
                                                {
                                                        "en": "around 300,000 VND",
                                                        "vn": "khoảng 300.000 VNĐ"
                                                },
                                                {
                                                        "en": "about 500,000 VND",
                                                        "vn": "khoảng 500.000 VNĐ"
                                                }
                                        ]
                                },
                                {
                                        "type": "benefit",
                                        "title": "Cụm Mục đích / Lợi ích:",
                                        "items": [
                                                {
                                                        "isNote": true,
                                                        "vn": "👉 (Sử dụng các cụm trong BẢNG LỢI ÍCH B2)"
                                                }
                                        ]
                                }
                        ]
                }
        ]
};

const whShowcase = document.getElementById('wh-showcase');

    window.filterWh = (cat) => {
        document.querySelectorAll('.w-pill').forEach(p => p.classList.remove('active'));
        if (typeof window !== 'undefined' && window.event && window.event.currentTarget && window.event.currentTarget.classList) {
            window.event.currentTarget.classList.add('active');
        }
        if (!whShowcase) return;
        const list = whBank[cat] || [];
        whShowcase.innerHTML = `
            <div class="wh-grid fade-in" style="grid-template-columns: 1fr; gap: 1.5rem;">
                ${list.map(item => `
                    <div class="f-card-clean" style="max-width:100%; margin:0; background:var(--bg-card); padding:1.5rem; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                        <div class="f-title" style="margin-bottom:1.5rem;">${formatTitleHighlight(item.title)}</div>
                        ${getExamplesBlockHTML(item)}
                        
                        <div class="accordion-box" onclick="this.classList.toggle('open')" style="margin-bottom: 1.25rem; border: 2px solid #3b82f6; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);">
                            <div class="accordion-header" style="padding: 1rem 1.25rem; background: rgba(59, 130, 246, 0.08);">
                                <div class="acc-title" style="color:#2563eb; font-size:1.05rem;"><i class="fa-solid fa-lightbulb"></i> GỢI Ý CÂU TRẢ LỜI</div>
                                <div class="acc-toggle" style="background:#2563eb;"><span class="txt-close"><i class="fa-solid fa-hand-pointer"></i> Nhấn để xem gợi ý câu trả lời ▼</span><span class="txt-open"><i class="fa-solid fa-chevron-up"></i> Thu gọn ▲</span></div>
                            </div>
                            <div class="accordion-content" onclick="event.stopPropagation()">
                                <div class="f-formula-box" style="margin: 0; border: none; background: transparent; padding: 0.5rem 0;">${formatFormulaHighlight(item.formula)}</div>
                                ${item.note ? `<div class="tpl-note mt-2 mb-2" style="display:block;"><i class="fa-solid fa-circle-exclamation"></i> ${item.note}</div>` : ''}
                                ${getSuggestionsHTML(item)}
                            </div>
                        </div>

                        <div class="accordion-box" onclick="this.classList.toggle('open')" style="margin-bottom: 0; border: 2px solid #8b5cf6; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.1);">
                            <div class="accordion-header" style="padding: 1rem 1.25rem; background: rgba(139, 92, 246, 0.08);">
                                <div class="acc-title" style="color:#7c3aed; font-size:1.05rem;"><i class="fa-solid fa-desktop"></i> VÍ DỤ THỰC HÀNH</div>
                                <div class="acc-toggle" style="background:#7c3aed;"><span class="txt-close"><i class="fa-solid fa-hand-pointer"></i> Nhấn vào hiện câu hỏi ▼</span><span class="txt-open"><i class="fa-solid fa-chevron-up"></i> Thu gọn ▲</span></div>
                            </div>
                            <div class="accordion-content" onclick="event.stopPropagation()">
                                <div class="f-example-box" style="margin: 0; border: none; background: transparent; padding: 0.5rem 0;">
                                    <div class="ex-label" style="font-size:1.1rem; color:var(--text-main); margin-bottom:0.75rem; text-transform:none;">
                                        ❓ Câu hỏi: <strong>${item.exQ}</strong>
                                    </div>
                                    <div style="margin-top:0.75rem;">
                                        <button class="btn-audio-sample" style="background:#8b5cf6; margin-bottom:0.5rem; cursor:pointer;" onclick="toggleSampleAnswer(this)">
                                            <i class="fa-solid fa-eye"></i> Nhấn xem câu trả lời mẫu
                                        </button>
                                        <div class="fade-in" style="display:none; margin-top:0.75rem; padding-top:0.75rem; border-top:1px dashed var(--border);">
                                            <div class="ex-text" style="color:var(--secondary); font-weight:500; font-size:1.05rem; line-height:1.8;">${item.exAFormatted || item.exA}</div>
                                            <button class="btn-audio-sample mt-2" onclick="speakText('${item.exA.replace(/<[^>]*>/g, '').replace(/→/g, '').replace(/'/g, "\\'").trim()}')">
                                                <i class="fa-solid fa-volume-high"></i> Nghe Audio phát âm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    };
    filterWh('what');

    // =========================================
    // AUDIO RECORDING LOGIC
    // =========================================
    let mediaRecorder = null;
    let audioChunks = [];
    let currentStream = null;

    window.toggleRecording = async (type) => {
        const btn = document.getElementById(`btn-record-${type}`);
        const status = document.getElementById(`recording-status-${type}`);
        const playback = document.getElementById(`audio-playback-${type}`);
        const submitBtn = document.getElementById(`btn-submit-${type}`);

        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Ghi âm lại';
            btn.style.background = '#3b82f6';
            btn.style.boxShadow = '0 4px 10px rgba(59,130,246,0.3)';
            status.style.display = 'none';
            if (currentStream) currentStream.getTracks().forEach(t => t.stop());
            return;
        }

        try {
            playback.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'none';
            audioChunks = [];
            currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(currentStream);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                playback.src = audioUrl;
                playback.style.display = 'block';
                
                // Attach the blob to the submit button
                if (submitBtn) {
                    submitBtn.style.display = 'block';
                    submitBtn.dataset.blobUrl = audioUrl;
                }
            };

            mediaRecorder.start();
            btn.innerHTML = '<i class="fa-solid fa-stop"></i> Dừng ghi âm';
            btn.style.background = '#ef4444';
            btn.style.boxShadow = '0 4px 10px rgba(239,68,68,0.3)';
            status.style.display = 'block';

        } catch (err) {
            alert('Không thể truy cập Micro. Vui lòng cấp quyền Microphone cho trình duyệt (hoặc bạn đang không dùng HTTPS/localhost)!');
        }
    };

    window.submitAudio = (type) => {
        const submitBtn = document.getElementById(`btn-submit-${type}`);
        if (!submitBtn || !submitBtn.dataset.blobUrl) return;

        // 1. Download file automatically
        const a = document.createElement('a');
        a.href = submitBtn.dataset.blobUrl;
        
        // Tạo tên file có ngày giờ để tránh trùng lặp
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        a.download = `VSTEP_Speaking_${type}_${dateStr}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // 2. Alert
        alert('Đã tải xuống bản ghi âm của bạn thành công!');
    };

    // Random Practice Selector
    
    window.spinWheel = (type) => {
        let pool = [];
        let qEl, hintEl, btn;

        if (type === 'wh') {
            const safeWhBank = typeof whBank !== 'undefined' ? whBank : {};
            const whValues = Object.values(safeWhBank);
            // Fallback for browsers that don't support .flat()
            pool = whValues.flat ? whValues.flat() : whValues.reduce((acc, val) => acc.concat(val), []);
            qEl = document.getElementById('wheel-q');
            hintEl = document.getElementById('wheel-hint');
            btn = document.getElementById('spin-btn');
        } else if (type === 'yn') {
            pool = typeof ynFormulas !== 'undefined' ? ynFormulas : [];
            qEl = document.getElementById('wheel-q-yn');
            hintEl = document.getElementById('wheel-hint-yn');
            btn = document.getElementById('spin-btn-yn');
        } else if (type === 'choice') {
            const safeChoiceData = typeof choiceData !== 'undefined' ? choiceData : {};
            const choiceValues = Object.values(safeChoiceData);
            pool = choiceValues.flat ? choiceValues.flat() : choiceValues.reduce((acc, val) => acc.concat(val), []);
            qEl = document.getElementById('wheel-q-choice');
            hintEl = document.getElementById('wheel-hint-choice');
            btn = document.getElementById('spin-btn-choice');
        }

        if (!pool || pool.length === 0 || !qEl || !btn) return;

        // Flatten the pool to include ALL examples as individual questions
        let flattenedPool = [];
        let choiceMap = {};

        pool.forEach(item => {
            if (item.examples && item.examples.length > 0) {
                item.examples.forEach(ex => {
                    let cleanQ = ex.q.replace(/<[^>]*>/g, '').trim();
                    
                    if (type === 'choice') {
                        if (choiceMap[cleanQ]) {
                            // Combine Cách 1 and Cách 2
                            let existing = choiceMap[cleanQ];
                            let f1 = existing.exAFormatted;
                            let f2 = ex.f;
                            
                            existing.exAFormatted = `<div style="margin-bottom: 12px;"><div style="color:#2563eb; font-weight:bold; margin-bottom:4px;">🎯 CÁCH 1 (Chọn 1 trong 2):</div>${f1}</div><div><div style="color:#16a34a; font-weight:bold; margin-bottom:4px;">🎯 CÁCH 2 (Cả 2 đều quan trọng):</div>${f2}</div>`;
                            existing.exA = existing.exA + " OR " + ex.a;
                            // Clear formula since it varies by Cách
                            existing.formula = "Hãy tham khảo 2 cách trả lời mẫu bên dưới.";
                        } else {
                            let newEx = { 
                                ...item, 
                                exQ: ex.q, 
                                originalQ: item.exQ || item.title,
                                exAFormatted: ex.f, 
                                exA: ex.a 
                            };
                            choiceMap[cleanQ] = newEx;
                            flattenedPool.push(newEx);
                        }
                    } else {
                        flattenedPool.push({ 
                            ...item, 
                            exQ: ex.q, 
                            originalQ: item.exQ || item.title,
                            exAFormatted: ex.f, 
                            exA: ex.a 
                        });
                    }
                });
            } else {
                flattenedPool.push(item);
            }
        });
        pool = flattenedPool;

        btn.disabled = true;
        let c = 0;
        const int = setInterval(() => {
            const rand = pool[Math.floor(Math.random() * pool.length)];
            if (rand) {
                qEl.textContent = (rand.exQ || rand.title || "Câu hỏi ngẫu nhiên").replace(/<[^>]*>/g, '');
            }
            c++;
            if (c > 10) {
                clearInterval(int);
                const final = pool[Math.floor(Math.random() * pool.length)];
                if (final) {
                    qEl.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; gap:0.75rem; text-align:left;"><i class="fa-solid fa-microphone" style="color:#f59e0b; flex-shrink:0; font-size:1.5rem;"></i> <span>"${final.exQ || final.title || ''}"</span></div>`;
                    if (hintEl) {
                        hintEl.innerHTML = `
                            <div class="hint-toggle-btn" style="cursor:pointer; display:inline-flex; align-items:center; gap:0.5rem; font-weight:600; color:#d97706; padding:0.25rem 0;" onclick="this.nextElementSibling.style.display='block'; this.style.display='none';">
                                <i class="fa-solid fa-lightbulb"></i> GỢI Ý (Nhấp để xem)
                            </div>
                            <div class="hint-content fade-in" style="display:none; margin-top:0.5rem; font-size:1.05rem; line-height:1.6; text-align: left;">
                                <div style="margin-bottom: 0.75rem;">
                                    <strong style="color: #059669;">💡 Áp dụng Cấu trúc:</strong><br/> 
                                    <div style="background: rgba(16, 185, 129, 0.05); padding: 0.75rem; border-left: 3px solid #10b981; margin-top: 0.5rem; border-radius: 4px;">
                                        ${final.formula || ''}
                                    </div>
                                </div>
                                <div>
                                    <strong style="color: #64748b; font-size: 0.95em;">📝 Tham khảo câu mẫu:</strong><br/> 
                                    <div style="color: #64748b; font-size: 0.95em; margin-top: 0.25rem; font-style: italic;">
                                        ${final.exAFormatted || `"${final.exA || ''}"`}
                                    </div>
                                </div>
                            </div>
                        `;
                        hintEl.classList.remove('hidden');
                    }
                    speakText((final.exQ || final.title || '').replace(/<[^>]*>/g, ''));
                    
                    const recordBox = document.getElementById('record-box-' + type);
                    if (recordBox) {
                        recordBox.style.display = 'block';
                        const playback = document.getElementById('audio-playback-' + type);
                        if(playback) { playback.style.display = 'none'; playback.src = ''; }
                        const submitBtn = document.getElementById('btn-submit-' + type);
                        if(submitBtn) { submitBtn.style.display = 'none'; }
                        const btnRecord = document.getElementById('btn-record-' + type);
                        if(btnRecord) {
                            btnRecord.innerHTML = '<i class="fa-solid fa-microphone"></i> Bắt đầu Ghi âm';
                            btnRecord.style.background = '#ef4444';
                            btnRecord.style.boxShadow = '0 4px 10px rgba(239,68,68,0.3)';
                        }
                    }
                }
                btn.disabled = false;
            }
        }, 60);
    };

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    // =========================================
    // REVIEW GAMES LOGIC & SFX
    // =========================================
    let audioCtx = null;
    
    function playTone(freq, type, duration) {
        if (!state.isAudio) return;
        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            audioCtx = new AC();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }
    
    const sfx = window.sfx = {
        flip: () => playTone(300, 'sine', 0.1),
        correct: () => {
            playTone(600, 'sine', 0.1);
            setTimeout(() => playTone(800, 'sine', 0.15), 100);
        },
        wrong: () => {
            playTone(250, 'sawtooth', 0.2);
            setTimeout(() => playTone(200, 'sawtooth', 0.25), 100);
        },
        win: () => {
            playTone(400, 'sine', 0.1);
            setTimeout(() => playTone(500, 'sine', 0.1), 100);
            setTimeout(() => playTone(600, 'sine', 0.1), 200);
            setTimeout(() => playTone(800, 'sine', 0.4), 300);
        }
    };

    window.flipFlashcard = (containerEl, wordEn) => {
        if (!containerEl) return;
        const card = containerEl.querySelector('.flashcard');
        if (!card) return;
        if (!card.classList.contains('flipped')) {
            try { if (window.sfx && window.sfx.flip) window.sfx.flip(); } catch(e) {}
            card.classList.add('flipped');
            if (typeof window.speakText === 'function' && wordEn) {
                window.speakText(wordEn);
            }
        } else {
            card.classList.remove('flipped');
        }
    };
    
    function shootConfetti() {
        if (typeof confetti === 'function') {
            const duration = 2500;
            const end = Date.now() + duration;
            (function frame() {
                confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'], zIndex: 9999 });
                confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'], zIndex: 9999 });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }
    }
    let reviewWords = [];
    
    function extractReviewWords(tabId) {
        let currentWords = [];
        const cards = document.querySelectorAll('#' + tabId + ' .icon-btn');
        cards.forEach(btn => {
            const container = btn.parentElement;
            const enEl = container.querySelector('.vocab-en') || container.querySelector('strong');
            const vnEl = container.querySelector('.vocab-vn') || (enEl ? enEl.nextElementSibling : null);
            if (enEl && vnEl) {
                currentWords.push({
                    en: enEl.textContent.trim(),
                    vn: vnEl.textContent.trim()
                });
            }
        });
        return currentWords;
    }

    window.startReviewGame = (type, tabId) => {
        const words = extractReviewWords(tabId);
        if (words.length === 0) return;
        const tabEl = document.getElementById(tabId);
        const placeholder = tabEl.querySelector('.game-placeholder');
        const content = tabEl.querySelector('.game-content');
        
        if(placeholder) placeholder.style.display = 'none';
        if(content) content.style.display = 'block';
        
        if (type === 'flashcards' || type === 'flashcard') {
            initFlashcards(words, content, tabId);
        } else if (type === 'matching' || type === 'match') {
            initMatchingGame(words, content, tabId);
        } else if (type === 'quiz') {
            initQuizGame(words, content, tabId);
        } else if (type === 'spelling') {
            initSpellingGame(words, content, tabId);
        }
    };

    function initFlashcards(allWords, container, tabId) {
        let words = [...allWords].sort(() => 0.5 - Math.random());
        let currentIndex = 0;
        
        function renderCard() {
            if (currentIndex >= words.length) {
                sfx.win();
                shootConfetti();
                container.innerHTML = `
                    <div class="fade-in" style="text-align:center; padding: 2rem;">
                        <i class="fa-solid fa-trophy" style="font-size:4rem; color:#f59e0b; margin-bottom:1rem;"></i>
                        <h3 style="font-size:1.5rem; margin-bottom:1rem;">Tuyệt vời! Bạn đã ôn xong tất cả các từ.</h3>
                        <button class="btn btn-primary" onclick="startReviewGame('flashcards', '${tabId}')"><i class="fa-solid fa-rotate-right"></i> Ôn tập lại</button>
                    </div>
                `;
                return;
            }
            const word = words[currentIndex];
            container.innerHTML = `
                <div class="fade-in" style="display:flex; flex-direction:column; align-items:center; height:100%; justify-content:center;">
                    <div style="margin-bottom:1rem; font-weight:bold; color:var(--text-muted);">Thẻ ${currentIndex + 1} / ${words.length}</div>
                    <div class="flashcard-container" onclick="flipFlashcard(this, '${word.en.replace(/'/g, "\\'")}')">
                        <div class="flashcard">
                            <div class="flashcard-face flashcard-front">
                                <div class="fc-word">${word.en}</div>
                                <div class="fc-hint"><i class="fa-solid fa-hand-pointer"></i> Nhấp để lật xem nghĩa</div>
                            </div>
                            <div class="flashcard-face flashcard-back">
                                <div class="fc-word">${word.vn}</div>
                                <div class="fc-hint"><i class="fa-solid fa-volume-high"></i> Nhấp để lật & nghe lại</div>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:1rem; margin-top:1.5rem; flex-wrap:wrap; justify-content:center;">
                        <button class="btn" style="background:#fef2f2; color:#991b1b; border:1px solid #fecaca; box-shadow:none;" id="fc-btn-review"><i class="fa-solid fa-xmark"></i> Cần ôn lại</button>
                        <button class="btn" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; box-shadow:none;" id="fc-btn-gotit"><i class="fa-solid fa-check"></i> Đã thuộc</button>
                    </div>
                </div>
            `;
            
            document.getElementById('fc-btn-review').onclick = (e) => {
                e.stopPropagation();
                words.push(word); // move to end
                currentIndex++;
                renderCard();
            };
            document.getElementById('fc-btn-gotit').onclick = (e) => {
                e.stopPropagation();
                currentIndex++;
                renderCard();
            };
        }
        renderCard();
    }

    function initMatchingGame(allWords, container, tabId) {
        let pool = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 6);
        let items = [];
        pool.forEach((w, i) => {
            items.push({ id: i, text: w.en, type: 'en', word: w });
            items.push({ id: i, text: w.vn, type: 'vn', word: w });
        });
        items.sort(() => 0.5 - Math.random());
        
        container.innerHTML = `
            <div class="fade-in" style="display:flex; justify-content:space-between; margin-bottom:1.5rem; align-items:center; flex-wrap:wrap; gap:1rem;">
                <div style="font-weight:bold; color:var(--text-main); font-size:1.1rem;"><i class="fa-solid fa-link" style="color:var(--primary);"></i> Ghép các cặp từ tương ứng</div>
                <button class="btn btn-secondary" onclick="startReviewGame('matching', '${tabId}')" style="padding: 0.5rem 1rem; font-size: 0.9rem;"><i class="fa-solid fa-rotate-right"></i> Bài mới</button>
            </div>
            <div class="matching-grid fade-in" id="match-grid"></div>
        `;
        
        const grid = document.getElementById('match-grid');
        let selectedItem = null;
        let matchedCount = 0;
        let animating = false;
        
        items.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'match-card';
            card.textContent = item.text;
            card.onclick = () => {
                if (animating || card.classList.contains('matched') || card.classList.contains('selected')) return;
                
                if (!selectedItem) {
                    card.classList.add('selected');
                    selectedItem = { el: card, data: item };
                    if (item.type === 'en') speakText(item.text);
                } else {
                    animating = true;
                    if (selectedItem.data.id === item.id && selectedItem.data.type !== item.type) {
                        card.classList.add('selected');
                        sfx.correct();
                        if (item.type === 'en') speakText(item.text);
                        setTimeout(() => {
                            card.classList.remove('selected');
                            card.classList.add('matched');
                            selectedItem.el.classList.remove('selected');
                            selectedItem.el.classList.add('matched');
                            selectedItem = null;
                            matchedCount++;
                            animating = false;
                            if (matchedCount === 6) {
                                sfx.win();
                                shootConfetti();
                                setTimeout(() => {
                                    container.innerHTML = `
                                        <div class="fade-in" style="text-align:center; padding: 2rem;">
                                            <i class="fa-solid fa-star" style="font-size:4rem; color:#f59e0b; margin-bottom:1rem;"></i>
                                            <h3 style="font-size:1.5rem; margin-bottom:1rem;">Hoàn thành xuất sắc!</h3>
                                            <button class="btn btn-primary" onclick="startReviewGame('matching', '${tabId}')"><i class="fa-solid fa-play"></i> Chơi tiếp</button>
                                        </div>
                                    `;
                                }, 300);
                            }
                        }, 400);
                    } else {
                        card.classList.add('error');
                        selectedItem.el.classList.remove('selected');
                        selectedItem.el.classList.add('error');
                        sfx.wrong();
                        if (item.type === 'en') speakText(item.text);
                        setTimeout(() => {
                            card.classList.remove('error');
                            selectedItem.el.classList.remove('error');
                            selectedItem = null;
                            animating = false;
                        }, 500);
                    }
                }
            };
            grid.appendChild(card);
        });
    }

    function initQuizGame(allWords, container, tabId) {
        let words = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
        let currentIndex = 0;
        let score = 0;
        
        function renderQuiz() {
            if (currentIndex >= words.length) {
                sfx.win();
                shootConfetti();
                container.innerHTML = `
                    <div class="fade-in" style="text-align:center; padding: 2rem;">
                        <i class="fa-solid fa-award" style="font-size:4rem; color:#10b981; margin-bottom:1rem;"></i>
                        <h3 style="font-size:1.5rem; margin-bottom:0.5rem;">Hoàn thành Quiz!</h3>
                        <p style="font-size:1.2rem; margin-bottom:1.5rem;">Bạn đạt <strong style="color:var(--primary); font-size:1.5rem;">${score} / ${words.length}</strong> điểm.</p>
                        <button class="btn btn-primary" onclick="startReviewGame('quiz', '${tabId}')"><i class="fa-solid fa-rotate-right"></i> Làm lại</button>
                    </div>
                `;
                return;
            }
            
            const currentWord = words[currentIndex];
            let options = [currentWord];
            let distractors = [...allWords].filter(w => w.en !== currentWord.en).sort(() => 0.5 - Math.random()).slice(0, 3);
            options = [...options, ...distractors].sort(() => 0.5 - Math.random());
            
            container.innerHTML = `
                <div class="quiz-container fade-in">
                    <div style="display:flex; justify-content:space-between; margin-bottom:1.2rem; color:var(--text-muted); font-weight:600;">
                        <div>Câu hỏi: <span style="color:var(--text-main);">${currentIndex + 1} / ${words.length}</span></div>
                        <div>Điểm: <span style="color:var(--primary);">${score}</span></div>
                    </div>
                    <div class="quiz-question">Nghĩa tiếng Anh của:<br><span style="color:var(--text-main); font-size:1.6rem; display:block; margin-top:0.75rem;">"${currentWord.vn}"</span></div>
                    <div class="quiz-options">
                        ${options.map((opt, i) => `
                            <div class="quiz-option" data-ans="${opt.en === currentWord.en}">
                                <div style="background:var(--border); border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${['A', 'B', 'C', 'D'][i]}</div>
                                <div>${opt.en}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            const opts = container.querySelectorAll('.quiz-option');
            let answered = false;
            opts.forEach(opt => {
                opt.onclick = () => {
                    if (answered) return;
                    answered = true;
                    const isCorrect = opt.getAttribute('data-ans') === 'true';
                    speakText(opt.querySelector('div:nth-child(2)').textContent);
                    
                    if (isCorrect) {
                        opt.classList.add('correct');
                        sfx.correct();
                        score++;
                    } else {
                        opt.classList.add('wrong');
                        sfx.wrong();
                        opts.forEach(o => {
                            if (o.getAttribute('data-ans') === 'true') o.classList.add('correct');
                        });
                    }
                    
                    setTimeout(() => {
                        currentIndex++;
                        renderQuiz();
                    }, 1500);
                };
            });
        }
        renderQuiz();
    }

    function initSpellingGame(allWords, container, tabId) {
        let words = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
        let currentIndex = 0;
        let score = 0;
        
        function renderSpelling() {
            if (currentIndex >= words.length) {
                sfx.win();
                shootConfetti();
                container.innerHTML = `
                    <div class="fade-in" style="text-align:center; padding: 2rem;">
                        <i class="fa-solid fa-medal" style="font-size:4rem; color:#ec4899; margin-bottom:1rem;"></i>
                        <h3 style="font-size:1.5rem; margin-bottom:0.5rem;">Hoàn thành Thử Thách Gõ Từ!</h3>
                        <p style="font-size:1.2rem; margin-bottom:1.5rem;">Bạn gõ đúng <strong style="color:var(--primary); font-size:1.5rem;">${score} / ${words.length}</strong> từ.</p>
                        <button class="btn btn-primary" onclick="startReviewGame('spelling', '${tabId}')"><i class="fa-solid fa-rotate-right"></i> Làm lại</button>
                    </div>
                `;
                return;
            }
            
            const currentWord = words[currentIndex];
            
            container.innerHTML = `
                <div class="quiz-container fade-in" style="max-width: 500px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:1.2rem; color:var(--text-muted); font-weight:600;">
                        <div>Câu hỏi: <span style="color:var(--text-main);">${currentIndex + 1} / ${words.length}</span></div>
                        <div>Điểm: <span style="color:var(--primary);">${score}</span></div>
                    </div>
                    <div class="quiz-question" style="margin-bottom:1.5rem; position:relative;">
                        <div style="color:var(--text-muted); font-size:1rem; margin-bottom:0.5rem;">Nghĩa tiếng Việt:</div>
                        <div style="color:var(--text-main); font-size:1.6rem; margin-bottom:1.5rem; line-height:1.4;">"${currentWord.vn}"</div>
                        <button class="icon-btn" onclick="speakText('${currentWord.en.replace(/'/g, "\\'")}')" style="margin: 0 auto; background:var(--bg-body); width: 45px; height: 45px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Nghe gợi ý"><i class="fa-solid fa-volume-high"></i></button>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:1rem;">
                        <input type="text" id="spell-input" placeholder="Gõ tiếng Anh vào đây..." autocomplete="off" spellcheck="false" style="width:100%; padding:1rem 1.5rem; font-size:1.2rem; border-radius:12px; border:2px solid var(--border); background:var(--bg-card); color:var(--text-main); outline:none; transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
                        <div id="spell-error" style="color:#ef4444; font-size:0.9rem; display:none;">Chưa đúng, thử lại nhé!</div>
                        <button class="btn btn-primary" id="spell-btn" style="width:100%; padding:1rem; font-size:1.1rem; background:linear-gradient(135deg, #ec4899, #be185d); border:none;"><i class="fa-solid fa-paper-plane"></i> Kiểm tra</button>
                    </div>
                </div>
            `;
            
            const input = document.getElementById('spell-input');
            const btn = document.getElementById('spell-btn');
            const errorText = document.getElementById('spell-error');
            setTimeout(() => input.focus(), 100);
            
            let attempts = 0;
            
            function checkAnswer() {
                const val = input.value.trim().toLowerCase();
                const correctVal = currentWord.en.toLowerCase();
                
                if (val === correctVal) {
                    sfx.correct();
                    speakText(currentWord.en);
                    input.style.borderColor = '#22c55e';
                    input.style.backgroundColor = '#dcfce7';
                    input.style.color = '#166534';
                    btn.disabled = true;
                    if (attempts === 0) score++;
                    setTimeout(() => {
                        currentIndex++;
                        renderSpelling();
                    }, 1500);
                } else {
                    sfx.wrong();
                    attempts++;
                    input.style.borderColor = '#ef4444';
                    input.classList.add('error');
                    errorText.style.display = 'block';
                    input.value = '';
                    
                    if (attempts >= 3) {
                        errorText.innerHTML = `Đáp án đúng: <strong style="color:#111;">${currentWord.en}</strong>`;
                    }
                    
                    setTimeout(() => {
                        input.classList.remove('error');
                    }, 500);
                }
            }
            
            btn.onclick = checkAnswer;
            input.onkeypress = (e) => {
                if (e.key === 'Enter') checkAnswer();
            };
        }
        renderSpelling();
    }

    } catch(e) {
        console.error('JS Error: ', e);
    }
});




window.switchSubTab = function(tabId, btnElement) {
    document.querySelectorAll('.subtab-pane').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
        el.style.display = 'none';
    });
    const target = document.getElementById('subtab-' + tabId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
        target.style.display = 'block';
    }
    
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--primary)';
        btn.style.boxShadow = 'none';
    });
    
    const activeBtn = btnElement || (window.event && window.event.currentTarget) || document.querySelector(`.sub-tab-btn[onclick*="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'var(--primary)';
        activeBtn.style.color = '#ffffff';
        activeBtn.style.boxShadow = '0 4px 12px rgba(67, 97, 238, 0.3)';
    }
};

// ==========================================================================
// PRACTICE TOPICS DATA & ENGINE (B2 LEVEL)
// ==========================================================================
const practiceTopicsData = [
    {
        id: 1,
        title: "Chủ đề 01: Let's talk about hobbies",
        introText: "Let’s talk about hobbies.",
        questions: [
            {
                qNum: 1,
                question: "What hobbies do you have?",
                qType: "Wh-question: What hobbies do you have?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Nêu một sở thích tiêu biểu & lý do):</div>
                    <div class="topic-formula-text">
                        → One of my favorite hobbies is <span class="formula-bracket-hl">[sở thích - V-ing / danh từ]</span> because I find it both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Nêu thói quen trong thời gian rảnh & các hoạt động phong phú):</div>
                    <div class="topic-formula-text">
                        → In my spare time, I tend to <span class="formula-bracket-hl">[hoạt động - Vo]</span> because it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span>. Sometimes, I also <span class="formula-bracket-hl">[hoạt động - Vo]</span>, which gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🎯 [Sở thích phổ biến]:",
                        items: [
                            { en: "reading self-help books", vn: "đọc sách phát triển bản thân" },
                            { en: "playing badminton", vn: "chơi cầu lông" },
                            { en: "listening to acoustic music", vn: "nghe nhạc mộc acoustic" },
                            { en: "cooking nutritious meals", vn: "nấu các bữa ăn giàu dinh dưỡng" },
                            { en: "traveling to new destinations", vn: "du lịch khám phá vùng đất mới" },
                            { en: "doing yoga and meditation", vn: "tập yoga và thiền" }
                        ]
                    },
                    {
                        title: "✨ [Kho tính từ mô tả (Học viên chọn 2 tính từ kết hợp với 'and')]:",
                        items: [
                            { en: "entertaining", vn: "mang tính giải trí cao" },
                            { en: "educational", vn: "giàu tính giáo dục" },
                            { en: "relaxing", vn: "thư thái / thư giãn" },
                            { en: "refreshing", vn: "sảng khoái / tươi mới" },
                            { en: "creative", vn: "giàu tính sáng tạo" },
                            { en: "rewarding", vn: "bổ ích / rất xứng đáng" },
                            { en: "inspiring", vn: "truyền cảm hứng mạnh mẽ" },
                            { en: "thought-provoking", vn: "khơi gợi tư duy sâu sắc" },
                            { en: "fascinating", vn: "lôi cuốn / hấp dẫn" },
                            { en: "challenging", vn: "đầy thử thách" },
                            { en: "meaningful", vn: "giàu ý nghĩa nhân văn" },
                            { en: "enjoyable", vn: "thú vị / mang lại niềm vui" },
                            { en: "motivating", vn: "tạo nhiều động lực" },
                            { en: "healthy", vn: "lành mạnh cho thể chất & tinh thần" },
                            { en: "practical", vn: "thiết thực và có ích" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Cụm Lợi Ích Chuẩn B2]:",
                        note: `Sử dụng các cụm từ trong <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>unwind after a tiring day, broaden my horizons, stay in good shape, boost my mental well-being, explore diverse cultures...</em>).`
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Sở thích đọc sách - Vừa giải trí vừa mở rộng tầm nhìn)",
                        text: "One of my favorite hobbies is reading self-help books because I find it both entertaining and educational. It allows me to unwind after a tiring day and gives me a chance to broaden my horizons.",
                        formatted: `→ One of my favorite hobbies is <span class="sub-hl">reading self-help books</span> because I find it both <span class="sub-hl">entertaining and educational</span>. It allows me to <span class="sub-hl">unwind after a tiring day</span> and gives me a chance to <span class="sub-hl">broaden my horizons</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Chơi cầu lông & Du lịch khám phá)",
                        text: "In my spare time, I tend to play badminton because it allows me to stay in good shape. Sometimes, I also travel to new destinations, which gives me an opportunity to experience different cultures.",
                        formatted: `→ In my spare time, I tend to <span class="sub-hl">play badminton</span> because it allows me to <span class="sub-hl">stay in good shape</span>. Sometimes, I also <span class="sub-hl">travel to new destinations</span>, which gives me an opportunity to <span class="sub-hl">experience different cultures</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "Who do you usually do your hobbies with?",
                qType: "Wh-question: Who do you usually [Vo] with?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Thực hiện cùng bạn bè / người thân vì có chung sở thích):</div>
                    <div class="topic-formula-text">
                        → I often <span class="formula-bracket-hl">[hoạt động - Vo]</span> with my <span class="formula-bracket-hl">[đối tượng]</span> because <span class="formula-bracket-hl">[lý do]</span>. I find it much more <span class="formula-bracket-hl">[tính từ so sánh hơn]</span> when doing it together, and it allows us to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Thích thực hiện một mình để tìm sự yên bình & tự do nhịp độ):</div>
                    <div class="topic-formula-text">
                        → Although my friends sometimes invite me to join them, I usually prefer <span class="formula-bracket-hl">[hoạt động - V-ing]</span> alone because I find it more <span class="formula-bracket-hl">[tính từ so sánh hơn]</span>. It gives me a chance to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "👥 [Đối tượng đồng hành]:",
                        items: [
                            { en: "my close friends", vn: "những người bạn thân thiết" },
                            { en: "my family members", vn: "các thành viên trong gia đình" },
                            { en: "my colleagues / classmates", vn: "đồng nghiệp / bạn học cùng lớp" },
                            { en: "like-minded people", vn: "những người có cùng chí hướng / sở thích" }
                        ]
                    },
                    {
                        title: "💡 [Gợi ý lý do đồng hành (thay vào [lý do])]:",
                        items: [
                            { en: "we share similar interests", vn: "chúng tôi có chung sở thích" },
                            { en: "we have a lot in common", vn: "chúng tôi có nhiều điểm tương đồng" },
                            { en: "we want to spend quality time together", vn: "chúng tôi muốn dành thời gian chất lượng bên nhau" },
                            { en: "they always motivate and support me", vn: "họ luôn thúc đẩy và ủng hộ tôi" },
                            { en: "it's a great way to stay connected", vn: "đó là cách tuyệt vời để giữ gắn kết" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ so sánh hơn (đã tách riêng & bổ sung từ quen thuộc)]:",
                        items: [
                            { en: "more fun", vn: "vui vẻ hơn" },
                            { en: "more relaxing", vn: "thư thái / thư giãn hơn" },
                            { en: "more exciting", vn: "hào hứng / phấn khích hơn" },
                            { en: "more enjoyable", vn: "thú vị / mang lại nhiều niềm vui hơn" },
                            { en: "more motivating", vn: "tạo nhiều động lực hơn" },
                            { en: "more comfortable", vn: "thoải mái hơn" },
                            { en: "more interesting", vn: "thú vị / hấp dẫn hơn" },
                            { en: "more peaceful", vn: "yên bình hơn" },
                            { en: "more flexible", vn: "linh hoạt hơn về thời gian" },
                            { en: "more thrilling", vn: "kịch tính / hồi hộp hơn" },
                            { en: "more productive", vn: "hiệu quả hơn" },
                            { en: "more contemplative", vn: "tĩnh tâm / chiêm nghiệm sâu sắc hơn" }
                        ]
                    },
                    {
                        title: "👥 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Khi tham gia cùng người khác]:",
                        items: [
                            { en: "strengthen our bond", vn: "thắt chặt tình cảm gắn kết" },
                            { en: "share memorable moments", vn: "chia sẻ những khoảnh khắc đáng nhớ" },
                            { en: "learn from each other", vn: "học hỏi kinh nghiệm lẫn nhau" },
                            { en: "encourage each other to keep practicing", vn: "khích lệ nhau cùng duy trì luyện tập" }
                        ]
                    },
                    {
                        title: "👤 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Khi thực hiện một mình]:",
                        items: [
                            { en: "proceed at my own pace", vn: "làm theo nhịp độ của riêng mình" },
                            { en: "focus completely without distractions", vn: "tập trung trọn vẹn mà không bị xao nhãng" },
                            { en: "enjoy my own personal space", vn: "tận hưởng không gian riêng tư của bản thân" },
                            { en: "clear my mind and reflect", vn: "thư thái đầu óc và tĩnh tâm suy ngẫm" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Chơi thể thao cùng bạn thân - Tăng động lực & Gắn kết)",
                        text: "I often play badminton with my close friends because we share similar interests. I find it much more motivating when practicing together, and it allows us to strengthen our bond and share enjoyable moments.",
                        formatted: `→ I often <span class="sub-hl">play badminton</span> with my <span class="sub-hl">close friends</span> because <span class="sub-hl">we share similar interests</span>. I find it much more <span class="sub-hl">motivating</span> when practicing together, and it allows us to <span class="sub-hl">strengthen our bond</span> and <span class="sub-hl">share enjoyable moments</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Đọc sách một mình để tĩnh tâm & thư giãn đầu óc)",
                        text: "Although my friends sometimes invite me to join them, I usually prefer reading books alone because I find it more peaceful. It gives me a chance to clear my mind and proceed at my own pace.",
                        formatted: `→ Although my friends sometimes invite me to join them, I usually prefer <span class="sub-hl">reading books alone</span> because I find it more <span class="sub-hl">peaceful</span>. It gives me a chance to <span class="sub-hl">clear my mind and proceed at my own pace</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "How much time do you spend on your hobbies?",
                qType: "Wh-question: How much time do you spend on your hobbies?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Cấu trúc nhượng bộ dù bận rộn vẫn dành thời gian chăm sóc bản thân):</div>
                    <div class="topic-formula-text">
                        → Although I have a hectic schedule, I still try to dedicate about <span class="formula-bracket-hl">[khoảng thời gian]</span> to <span class="formula-bracket-hl">[hoạt động - V-ing]</span> every day/week because it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>. It also makes me feel <span class="formula-bracket-hl">[tính từ cảm xúc]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Phân chia thời gian giữa ngày thường và cuối tuần):</div>
                    <div class="topic-formula-text">
                        → On weekdays, I can only spare about <span class="formula-bracket-hl">[khoảng thời gian]</span> to <span class="formula-bracket-hl">[hoạt động - Vo]</span>. However, on weekends, I usually spend several hours on it because it gives me an opportunity to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "⏱️ [Cụm từ chỉ lượng thời gian]:",
                        items: [
                            { en: "about an hour every evening", vn: "khoảng 1 tiếng mỗi buổi tối" },
                            { en: "30 to 45 minutes daily", vn: "30 đến 45 phút mỗi ngày" },
                            { en: "two to three hours at weekends", vn: "2 đến 3 tiếng vào dịp cuối tuần" },
                            { en: "a couple of hours on Sundays", vn: "một vài tiếng vào mỗi Chủ nhật" }
                        ]
                    },
                    {
                        title: "🧘 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Phục hồi năng lượng]:",
                        items: [
                            { en: "release stress", vn: "giải tỏa căng thẳng áp lực" },
                            { en: "recharge my batteries", vn: "nạp lại năng lượng tinh thần" },
                            { en: "maintain a healthy work-life balance", vn: "duy trì cân bằng công việc - cuộc sống" },
                            { en: "escape from daily pressure", vn: "thoát khỏi những áp lực thường nhật" }
                        ]
                    },
                    {
                        title: "😊 [Tính từ cảm xúc B2]:",
                        items: [
                            { en: "rejuvenated / refreshed", vn: "sảng khoái / tươi mới" },
                            { en: "energetic", vn: "tràn đầy sinh lực" },
                            { en: "content and fulfilled", vn: "mãn nguyện và thỏa mãn" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Dành 1 tiếng tập yoga mỗi ngày - Giảm stress & Tươi mới)",
                        text: "Although I have a hectic schedule, I still try to dedicate about an hour to practicing yoga every day because it allows me to release stress and maintain a healthy lifestyle. It also makes me feel rejuvenated.",
                        formatted: `→ Although I have a hectic schedule, I still try to dedicate about <span class="sub-hl">an hour</span> to <span class="sub-hl">practicing yoga</span> every day because it allows me to <span class="sub-hl">release stress</span> and <span class="sub-hl">maintain a healthy lifestyle</span>. It also makes me feel <span class="sub-hl">rejuvenated</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Ngày thường 30 phút, cuối tuần dành nhiều thời gian đọc sách)",
                        text: "On weekdays, I can only spare about 30 minutes in the evening to read books. However, on weekends, I usually spend several hours on it because it gives me an opportunity to escape from daily pressure and expand my knowledge.",
                        formatted: `→ On weekdays, I can only spare about <span class="sub-hl">30 minutes in the evening</span> to <span class="sub-hl">read books</span>. However, on weekends, I usually spend several hours on it because it gives me an opportunity to <span class="sub-hl">escape from daily pressure</span> and <span class="sub-hl">expand my knowledge</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        title: "Chủ đề 02: Let's talk about video games",
        introText: "Let’s talk about video games.",
        questions: [
            {
                qNum: 1,
                question: "What video game do you often play?",
                qType: "Wh-question: What video game do you often play?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Nêu tên game yêu thích kèm 2 tính từ B2):</div>
                    <div class="topic-formula-text">
                        → One of my favorite video games is <span class="formula-bracket-hl">[tên trò chơi]</span> because I find it both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Nêu thiết bị chơi và mục đích thư giãn trí tuệ):</div>
                    <div class="topic-formula-text">
                        → Whenever I want to unwind, I tend to play <span class="formula-bracket-hl">[tên trò chơi]</span> on my <span class="formula-bracket-hl">[thiết bị]</span>. It offers a/an <span class="formula-bracket-hl">[tính từ mô tả trải nghiệm]</span> experience because it allows me to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🎮 [Tên trò chơi & thể loại]:",
                        items: [
                            { en: "online chess", vn: "cờ vua trực tuyến" },
                            { en: "Minecraft", vn: "game sinh tồn xây dựng thế giới Minecraft" },
                            { en: "FIFA football", vn: "trò chơi bóng đá FIFA" },
                            { en: "League of Legends", vn: "Liên Minh Huyền Thoại (chiến thuật đồng đội)" },
                            { en: "PUBG Mobile", vn: "game bắn súng sinh tồn PUBG" },
                            { en: "Genshin Impact", vn: "game phiêu lưu khám phá thế giới mở" }
                        ]
                    },
                    {
                        title: "✨ [Kho tính từ mô tả game / trải nghiệm]:",
                        items: [
                            { en: "entertaining", vn: "mang tính giải trí cao" },
                            { en: "mentally stimulating", vn: "kích thích tư duy não bộ" },
                            { en: "fascinating", vn: "lôi cuốn / cuốn hút" },
                            { en: "competitive", vn: "đầy tính cạnh tranh" },
                            { en: "relaxing", vn: "thư thái / giải tỏa căng thẳng" },
                            { en: "creative", vn: "khơi gợi sức sáng tạo" },
                            { en: "thrilling", vn: "hồi hộp / kịch tính" },
                            { en: "engaging", vn: "hấp dẫn / thu hút" },
                            { en: "challenging", vn: "đầy thử thách trí tuệ" }
                        ]
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Rèn luyện tư duy]:",
                        items: [
                            { en: "sharpen my tactical thinking", vn: "rèn luyện tư duy chiến thuật" },
                            { en: "boost my concentration", vn: "tăng cường khả năng tập trung" },
                            { en: "foster my creativity", vn: "nuôi dưỡng trí tưởng tượng sáng tạo" },
                            { en: "unwind after long study hours", vn: "xả hơi sau nhiều giờ học hành căng thẳng" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Cờ vua online - Kích thích tư duy & Rèn luyện chiến thuật)",
                        text: "One of my favorite video games is online chess because I find it both entertaining and mentally stimulating. It allows me to unwind after a busy day and gives me a chance to sharpen my tactical thinking.",
                        formatted: `→ One of my favorite video games is <span class="sub-hl">online chess</span> because I find it both <span class="sub-hl">entertaining and mentally stimulating</span>. It allows me to <span class="sub-hl">unwind after a busy day</span> and gives me a chance to <span class="sub-hl">sharpen my tactical thinking</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Minecraft trên laptop - Thúc đẩy sáng tạo & Giảm stress)",
                        text: "Whenever I want to unwind, I tend to play Minecraft on my laptop. It offers an engaging experience because it allows me to foster my creativity and escape from daily stress.",
                        formatted: `→ Whenever I want to unwind, I tend to play <span class="sub-hl">Minecraft on my laptop</span>. It offers <span class="sub-hl">an engaging experience</span> because it allows me to <span class="sub-hl">foster my creativity</span> and <span class="sub-hl">escape from daily stress</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "Why do you often play that game?",
                qType: "Wh-question: Why do you often play that game?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Cấu trúc B2 với effective way to & gives me a chance to):</div>
                    <div class="topic-formula-text">
                        → I’m really into playing this game because it’s an effective way to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span>. Besides, it gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Nêu cảm xúc thư thái & nâng cao kỹ năng phối hợp đồng đội):</div>
                    <div class="topic-formula-text">
                        → The primary reason is that playing this game makes me feel completely <span class="formula-bracket-hl">[tính từ cảm xúc]</span>. Moreover, it allows me to <span class="formula-bracket-hl">[lợi ích]</span>, which is very valuable in my life.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🎯 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH)]:",
                        items: [
                            { en: "escape from academic pressure", vn: "thoát khỏi áp lực học tập thi cử" },
                            { en: "sharpen my reflexes and quick thinking", vn: "rèn luyện phản xạ và tư duy nhạy bén" },
                            { en: "enhance my problem-solving skills", vn: "nâng cao kỹ năng xử lý vấn đề" },
                            { en: "collaborate effectively with teammates", vn: "phối hợp ăn ý với đồng đội" },
                            { en: "boost my hand-eye coordination", vn: "tăng sự phối hợp nhịp nhàng giữa tay và mắt" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Bảng Lợi Ích B2]:",
                        note: `Tham khảo thêm các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>clear my mind, regain my energy, improve my mood, relieve mental fatigue...</em>).`
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Thoát khỏi áp lực học tập & Rèn luyện phản xạ)",
                        text: "I’m really into playing this game because it’s an effective way to escape from academic pressure. Besides, it gives me a chance to sharpen my reflexes and problem-solving skills.",
                        formatted: `→ I’m really into playing this game because it’s an effective way to <span class="sub-hl">escape from academic pressure</span>. Besides, it gives me a chance to <span class="sub-hl">sharpen my reflexes and problem-solving skills</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cảm giác thư thái & Nâng cao kỹ năng làm việc nhóm)",
                        text: "The primary reason is that playing this game makes me feel completely relaxed after intense study hours. Moreover, it allows me to collaborate with my teammates, which helps enhance my teamwork skills.",
                        formatted: `→ The primary reason is that playing this game makes me feel completely <span class="sub-hl">relaxed after intense study hours</span>. Moreover, it allows me to <span class="sub-hl">collaborate with my teammates</span>, which helps <span class="sub-hl">enhance my teamwork skills</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Do you prefer playing video games alone or with friends? Why?",
                qType: "Choice question: Do you prefer [alone] or [with friends]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Lựa chọn dứt khoát 1 phương án kèm tính từ so sánh hơn B2):</div>
                    <div class="topic-formula-text">
                        → Personally, I prefer playing video games <span class="formula-bracket-hl">[lựa chọn: with friends / alone]</span> because I find it much more <span class="formula-bracket-hl">[tính từ so sánh hơn]</span>. It allows <span class="formula-bracket-hl">[me / us]</span> to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives <span class="formula-bracket-hl">[me / us]</span> a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cấu trúc nhượng bộ Although - Đánh giá cao cả hai nhưng nghiêng về một bên):</div>
                    <div class="topic-formula-text">
                        → Although playing <span class="formula-bracket-hl">[phương án nhượng bộ: alone / with friends]</span> has its own merits, I still lean towards playing <span class="formula-bracket-hl">[phương án lựa chọn: with friends / alone]</span> because it's far more <span class="formula-bracket-hl">[tính từ so sánh hơn]</span>. It allows <span class="formula-bracket-hl">[me / us]</span> to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "✨ [Tính từ so sánh hơn (đã tách riêng & bổ sung từ quen thuộc)]:",
                        items: [
                            { en: "much more collaborative", vn: "mang tính phối hợp đồng đội cao hơn nhiều" },
                            { en: "far more thrilling", vn: "kịch tính / hồi hộp hơn nhiều" },
                            { en: "far more engaging", vn: "cuốn hút / hấp dẫn hơn nhiều" },
                            { en: "more enjoyable", vn: "thú vị / vui vẻ hơn" },
                            { en: "more peaceful", vn: "yên bình hơn" },
                            { en: "more comfortable", vn: "thoải mái hơn" },
                            { en: "more exciting", vn: "hào hứng / phấn khích hơn" },
                            { en: "more flexible with time", vn: "linh hoạt và chủ động hơn về thời gian" }
                        ]
                    },
                    {
                        title: "👥 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Khi chơi cùng bạn bè]:",
                        items: [
                            { en: "strengthen our bond", vn: "thắt chặt tình bạn bè khăng khít" },
                            { en: "share enjoyable moments together", vn: "cùng chia sẻ những giây phút tràn ngập niềm vui" },
                            { en: "communicate and coordinate strategies", vn: "trao đổi và phối hợp chiến thuật ăn ý" }
                        ]
                    },
                    {
                        title: "👤 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Khi chơi một mình]:",
                        items: [
                            { en: "immerse myself fully in the storyline", vn: "đắm chìm trọn vẹn vào cốt truyện game" },
                            { en: "play at my own pace without distractions", vn: "chơi theo nhịp độ của mình không lo bị xao nhãng" },
                            { en: "avoid unnecessary peer pressure", vn: "tránh áp lực thắng thua từ bạn chơi" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Chọn chơi với bạn bè - Tính hợp tác cao & Gắn kết tình cảm)",
                        text: "Personally, I prefer playing video games with friends because I find it much more collaborative. It allows us to strengthen our bond and gives us a chance to share enjoyable moments together.",
                        formatted: `→ Personally, I prefer <span class="sub-hl">playing video games with friends</span> because I find it much more <span class="sub-hl">collaborative</span>. It allows us to <span class="sub-hl">strengthen our bond</span> and gives us a chance to <span class="sub-hl">share enjoyable moments together</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cấu trúc nhượng bộ - Nghiêng về chơi một mình để yên tĩnh)",
                        text: "Although playing with friends is quite entertaining, I still lean towards playing alone because it's far more peaceful. It allows me to immerse myself fully in the game and play at my own pace without any distractions.",
                        formatted: `→ Although playing with friends is quite entertaining, I still lean towards <span class="sub-hl">playing alone</span> because it's far more <span class="sub-hl">peaceful</span>. It allows me to <span class="sub-hl">immerse myself fully in the game</span> and <span class="sub-hl">play at my own pace without any distractions</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        title: "Chủ đề 03: Let's talk about books",
        introText: "Let’s talk about books.",
        questions: [
            {
                qNum: 1,
                question: "What is your favorite book?",
                qType: "Wh-question: What is your favorite book?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Nêu cuốn sách yêu thích nhất & 2 tính từ học thuật B2):</div>
                    <div class="topic-formula-text">
                        → One of my all-time favorite books is <span class="formula-bracket-hl">[tên cuốn sách]</span> because I find it both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Khẳng định đam mê với thể loại sách, rồi nêu tác phẩm tâm đắc):</div>
                    <div class="topic-formula-text">
                        → To be honest, I have a strong passion for reading <span class="formula-bracket-hl">[thể loại sách]</span>, and the book that impresses me the most is <span class="formula-bracket-hl">[tên cuốn sách]</span>. It offers profound insights and helps me <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "📖 [Tên tác phẩm & sách kinh điển]:",
                        items: [
                            { en: "The Alchemist", vn: "Nhà giả kim (Paulo Coelho)" },
                            { en: "Atomic Habits", vn: "Thói quen nguyên tử (James Clear)" },
                            { en: "How to Win Friends and Influence People", vn: "Đắc Nhân Tâm (Dale Carnegie)" },
                            { en: "To Kill a Mockingbird", vn: "Giết con chim nhại (Harper Lee)" },
                            { en: "Harry Potter series", vn: "Bộ tiểu thuyết Harry Potter (J.K. Rowling)" }
                        ]
                    },
                    {
                        title: "✨ [Kho tính từ mô tả sách (Học viên chọn 2 tính từ kết hợp với 'and')]:",
                        items: [
                            { en: "inspiring", vn: "truyền cảm hứng mạnh mẽ" },
                            { en: "thought-provoking", vn: "khơi gợi suy ngẫm sâu sắc" },
                            { en: "fascinating", vn: "hấp dẫn / lôi cuốn" },
                            { en: "educational", vn: "giàu giá trị giáo dục" },
                            { en: "meaningful", vn: "đầy ý nghĩa và giá trị nhân văn" },
                            { en: "eye-opening", vn: "mở mang tầm mắt" },
                            { en: "captivating", vn: "cuốn hút không thể rời mắt" },
                            { en: "motivational", vn: "tạo động lực to lớn" },
                            { en: "practical", vn: "thiết thực / có tính ứng dụng cao" }
                        ]
                    },
                    {
                        title: "🌱 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Đọc sách]:",
                        items: [
                            { en: "broaden my horizons", vn: "mở rộng tầm nhìn và sự hiểu biết" },
                            { en: "gain profound life lessons", vn: "thu nhận những bài học nhân sinh sâu sắc" },
                            { en: "cultivate positive habits", vn: "nuôi dưỡng những thói quen tích cực" },
                            { en: "pursue personal dreams with courage", vn: "can đảm theo đuổi ước mơ cá nhân" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Nhà Giả Kim - Truyền cảm hứng & Can đảm theo đuổi ước mơ)",
                        text: "One of my all-time favorite books is The Alchemist because I find it both inspiring and thought-provoking. It allows me to broaden my horizons and gives me an opportunity to pursue my personal dreams with courage.",
                        formatted: `→ One of my all-time favorite books is <span class="sub-hl">The Alchemist</span> because I find it both <span class="sub-hl">inspiring and thought-provoking</span>. It allows me to <span class="sub-hl">broaden my horizons</span> and gives me an opportunity to <span class="sub-hl">pursue my personal dreams with courage</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Atomic Habits - Sách phát triển bản thân & Xây dựng thói quen tốt)",
                        text: "To be honest, I have a strong passion for reading self-help books, and the book that impresses me the most is Atomic Habits. It offers profound insights and helps me cultivate good habits while breaking harmful ones.",
                        formatted: `→ To be honest, I have a strong passion for reading <span class="sub-hl">self-help books</span>, and the book that impresses me the most is <span class="sub-hl">Atomic Habits</span>. It offers profound insights and helps me <span class="sub-hl">cultivate good habits while breaking harmful ones</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "Do you prefer reading paper books or electronic books?",
                qType: "Choice question: Do you prefer [paper books] or [electronic books]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Lựa chọn dứt khoát 1 loại sách & đưa ra lý do thuyết phục):</div>
                    <div class="topic-formula-text">
                        → Personally, I prefer reading <span class="formula-bracket-hl">[lựa chọn: paper books / e-books]</span> because I find them much more <span class="formula-bracket-hl">[tính từ so sánh hơn]</span>. They allow me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and give me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cân bằng cả hai - Mỗi loại đều sở hữu lợi ích riêng biệt):</div>
                    <div class="topic-formula-text">
                        → In my opinion, both mediums offer distinct benefits. Paper books help me <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span>, whereas e-books allow me to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span> whenever I am on the go.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "✨ [Tính từ so sánh hơn]:",
                        items: [
                            { en: "more comfortable for my eyesight", vn: "dễ chịu hơn cho thị lực của tôi" },
                            { en: "more convenient and portable", vn: "tiện lợi và dễ dàng mang theo hơn" },
                            { en: "more tactile and authentic", vn: "cảm giác chạm chân thực và truyền thống hơn" },
                            { en: "more cost-effective", vn: "tiết kiệm chi phí hơn" }
                        ]
                    },
                    {
                        title: "📖 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Lợi thế của Sách Giấy]:",
                        items: [
                            { en: "protect my eyesight from screen glare", vn: "bảo vệ mắt khỏi ánh sáng xanh màn hình" },
                            { en: "concentrate deeply without digital notifications", vn: "tập trung sâu mà không bị ngắt quãng bởi thông báo" },
                            { en: "enjoy the authentic feel of turning real pages", vn: "tận hưởng cảm giác lật từng trang giấy thơm tho" }
                        ]
                    },
                    {
                        title: "📱 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Lợi thế của Sách Điện Tử]:",
                        items: [
                            { en: "store hundreds of titles in one lightweight device", vn: "lưu hàng trăm đầu sách trong thiết bị nhỏ gọn" },
                            { en: "access reading materials anytime, anywhere", vn: "truy cập kho tài liệu mọi lúc mọi nơi" },
                            { en: "look up vocabulary and take notes instantly", vn: "tra cứu từ vựng và ghi chú tức thì" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Chọn sách giấy - Dễ chịu cho mắt & Tập trung sâu)",
                        text: "Personally, I prefer reading paper books because I find them much more comfortable for my eyesight. They allow me to concentrate deeply without digital distractions and give me the authentic pleasure of turning real pages.",
                        formatted: `→ Personally, I prefer <span class="sub-hl">reading paper books</span> because I find them much more <span class="sub-hl">comfortable for my eyesight</span>. They allow me to <span class="sub-hl">concentrate deeply without digital distractions</span> and give me the authentic pleasure of turning real pages.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cân bằng cả hai - Sách giấy ở nhà & E-book khi di chuyển)",
                        text: "In my opinion, both mediums offer distinct benefits. Paper books help me protect my eyes and focus better, whereas e-books allow me to access hundreds of titles easily whenever I am on the go.",
                        formatted: `→ In my opinion, <span class="sub-hl">both mediums offer distinct benefits</span>. Paper books help me <span class="sub-hl">protect my eyes and focus better</span>, whereas e-books allow me to <span class="sub-hl">access hundreds of titles easily whenever I am on the go</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "What kinds of books do teenagers in your country enjoy reading?",
                qType: "Wh-question: What kinds of books do teenagers in your country enjoy reading?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Nêu các thể loại phổ biến kèm lý do hấp dẫn thanh thiếu niên):</div>
                    <div class="topic-formula-text">
                        → I believe most teenagers in my country are big fans of <span class="formula-bracket-hl">[thể loại 1]</span> and <span class="formula-bracket-hl">[thể loại 2]</span> because they find them <span class="formula-bracket-hl">[tính từ mô tả]</span>. These genres allow them to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and give them an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Phân nhóm đa dạng: vừa đọc giải trí vừa đọc phát triển bản thân):</div>
                    <div class="topic-formula-text">
                        → From my perspective, while many teenagers read <span class="formula-bracket-hl">[thể loại giải trí]</span> to relax, an increasing number also read <span class="formula-bracket-hl">[thể loại kỹ năng]</span>. These books allow them to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "📚 [Thể loại sách giới trẻ ưa chuộng]:",
                        items: [
                            { en: "comic books and manga", vn: "truyện tranh và manga Nhật Bản" },
                            { en: "fantasy and fiction novels", vn: "tiểu thuyết giả tưởng và viễn tưởng" },
                            { en: "personal development books", vn: "sách kỹ năng và phát triển bản thân" },
                            { en: "detective and adventure stories", vn: "truyện trinh thám và phiêu lưu mạo hiểm" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ mô tả thể loại]:",
                        items: [
                            { en: "highly entertaining", vn: "giàu tính giải trí cao" },
                            { en: "relatable and inspiring", vn: "gần gũi và truyền nhiều cảm hứng" },
                            { en: "practical and informative", vn: "thiết thực và cung cấp nhiều thông tin" }
                        ]
                    },
                    {
                        title: "🌟 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Đối với người trẻ]:",
                        items: [
                            { en: "relieve study pressure", vn: "giải tỏa áp lực bài vở học hành" },
                            { en: "foster their creative imagination", vn: "nuôi dưỡng trí tưởng tượng sáng tạo" },
                            { en: "acquire vital soft skills", vn: "tiếp thu các kỹ năng mềm quan trọng" },
                            { en: "cultivate a positive mindset", vn: "xây dựng tư duy và lối sống tích cực" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Truyện tranh & Tiểu thuyết giả tưởng - Giải tỏa áp lực & Phát huy sáng tạo)",
                        text: "I believe most teenagers in my country are big fans of comic books and fantasy novels because they find them highly entertaining. These genres allow them to relieve study pressure and give them an opportunity to foster their imagination.",
                        formatted: `→ I believe most teenagers in my country are big fans of <span class="sub-hl">comic books and fantasy novels</span> because they find them <span class="sub-hl">highly entertaining</span>. These genres allow them to <span class="sub-hl">relieve study pressure</span> and give them an opportunity to <span class="sub-hl">foster their imagination</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Xu hướng đọc sách phát triển bản thân để rèn kỹ năng mềm)",
                        text: "From my perspective, while many teenagers read fiction books to relax, an increasing number also read personal development books. These books allow them to acquire vital soft skills and cultivate a positive mindset.",
                        formatted: `→ From my perspective, while many teenagers read <span class="sub-hl">fiction books to relax</span>, an increasing number also read <span class="sub-hl">personal development books</span>. These books allow them to <span class="sub-hl">acquire vital soft skills</span> and <span class="sub-hl">cultivate a positive mindset</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 4,
        title: "Chủ đề 04: Let's talk about listening to the radio",
        introText: "Let’s talk about listening to the radio.",
        questions: [
            {
                qNum: 1,
                question: "Do you often listen to the radio?",
                qType: "Yes/No question: Do you often listen to the radio?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Có - Thường xuyên nghe khi di chuyển hoặc làm việc nhà):</div>
                    <div class="topic-formula-text">
                        → Sure. I often listen to the radio <span class="formula-bracket-hl">[thời điểm / tần suất]</span> whenever I have free time. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Không - Hiếm khi nghe radio truyền thống, ưu tiên nền tảng nhạc số/podcast):</div>
                    <div class="topic-formula-text">
                        → Not really. I rarely listen to traditional radio because I prefer digital platforms like <span class="formula-bracket-hl">[nền tảng số: Spotify / podcasts]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "📻 [Thời điểm & tần suất nghe]:",
                        items: [
                            { en: "on my daily commute", vn: "trên đường đi học/đi làm hàng ngày" },
                            { en: "while doing household chores", vn: "trong lúc dọn dẹp làm việc nhà" },
                            { en: "early in the morning", vn: "vào lúc sáng sớm" },
                            { en: "rarely / almost never", vn: "hiếm khi / hầu như không bao giờ" }
                        ]
                    },
                    {
                        title: "📡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Khi nghe radio / podcast]:",
                        items: [
                            { en: "catch up on traffic updates", vn: "nắm bắt các cập nhật về tình hình giao thông" },
                            { en: "enjoy cheerful music", vn: "thưởng thức âm nhạc vui vẻ tiếp thêm năng lượng" },
                            { en: "access on-demand content anytime", vn: "tiếp cận nội dung theo yêu cầu mọi lúc" },
                            { en: "avoid commercial interruptions", vn: "tránh bị ngắt quãng bởi quảng cáo" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Có - Nghe trên đường đi lại để cập nhật giao thông & Nghe nhạc)",
                        text: "Sure. I often listen to the radio on my daily commute whenever I am on the road. It allows me to catch up on traffic updates and gives me a chance to enjoy cheerful music to start my day.",
                        formatted: `→ Sure. I often listen to the radio <span class="sub-hl">on my daily commute</span> whenever I am on the road. It allows me to <span class="sub-hl">catch up on traffic updates</span> and gives me a chance to <span class="sub-hl">enjoy cheerful music to start my day</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Không - Ưu tiên podcast kỹ thuật số theo sở thích riêng)",
                        text: "Not really. I rarely listen to traditional radio because I prefer digital platforms like Spotify podcasts. It allows me to access on-demand content anytime and avoid commercial interruptions.",
                        formatted: `→ Not really. I rarely listen to traditional radio because I prefer <span class="sub-hl">digital platforms like Spotify podcasts</span>. It allows me to <span class="sub-hl">access on-demand content anytime</span> and <span class="sub-hl">avoid commercial interruptions</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "What radio station do you usually listen to?",
                qType: "Wh-question: What radio station do you usually listen to?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Nêu kênh radio phổ biến trong nước & lợi ích thực tế):</div>
                    <div class="topic-formula-text">
                        → One of my favorite radio channels is <span class="formula-bracket-hl">[tên kênh phát thanh]</span> because I find it very <span class="formula-bracket-hl">[tính từ mô tả]</span>. It allows me to stay updated on <span class="formula-bracket-hl">[thông tin quan tâm]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Nêu đài phát thanh quốc tế / luyện tiếng Anh chuẩn B2):</div>
                    <div class="topic-formula-text">
                        → To be honest, I regularly tune in to <span class="formula-bracket-hl">[tên kênh quốc tế]</span> because it's extremely <span class="formula-bracket-hl">[tính từ mô tả]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "📻 [Kênh phát thanh tiêu biểu]:",
                        items: [
                            { en: "VOV Traffic", vn: "Kênh VOV Giao Thông" },
                            { en: "BBC World Service", vn: "Kênh BBC toàn cầu (tiếng Anh chuẩn)" },
                            { en: "VOV1 - National News", vn: "Kênh Thời sự Quốc gia VOV1" },
                            { en: "VOA Learning English", vn: "Chương trình học tiếng Anh của VOA" },
                            { en: "Xone FM", vn: "Kênh âm nhạc giải trí Xone FM" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ mô tả kênh phát thanh]:",
                        items: [
                            { en: "informative and practical", vn: "giàu thông tin và có tính thực tế cao" },
                            { en: "extremely educational", vn: "vô cùng mang tính giáo dục" },
                            { en: "timely and helpful", vn: "kịp thời và hữu ích" }
                        ]
                    },
                    {
                        title: "🎯 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Kênh phát thanh]:",
                        items: [
                            { en: "avoid congested roads during rush hours", vn: "tránh các cung đường kẹt xe giờ cao điểm" },
                            { en: "hone my English listening skills", vn: "mài giũa kỹ năng nghe tiếng Anh" },
                            { en: "keep abreast of global news", vn: "bắt kịp các tin tức quốc tế" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Kênh VOV Giao thông - Thiết thực & Tránh tắc đường giờ cao điểm)",
                        text: "One of my favorite radio channels is VOV Traffic because I find it very informative and practical. It allows me to stay updated on traffic conditions and gives me a chance to avoid congested roads during rush hours.",
                        formatted: `→ One of my favorite radio channels is <span class="sub-hl">VOV Traffic</span> because I find it very <span class="sub-hl">informative and practical</span>. It allows me to <span class="sub-hl">stay updated on traffic conditions</span> and gives me a chance to <span class="sub-hl">avoid congested roads during rush hours</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Kênh BBC World Service - Nâng cao kỹ năng nghe tiếng Anh & Tin tức quốc tế)",
                        text: "To be honest, I regularly tune in to BBC World Service because it's extremely educational. It allows me to hone my English listening skills and gives me an opportunity to keep abreast of global news.",
                        formatted: `→ To be honest, I regularly tune in to <span class="sub-hl">BBC World Service</span> because it's extremely <span class="sub-hl">educational</span>. It allows me to <span class="sub-hl">hone my English listening skills</span> and gives me an opportunity to <span class="sub-hl">keep abreast of global news</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "What are the benefits of listening to the radio?",
                qType: "Wh-question: What are the benefits of listening to the radio?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Cấu trúc brings us a number of significant benefits):</div>
                    <div class="topic-formula-text">
                        → Listening to the radio brings us a number of significant benefits. For example, it allows us to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives us a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Lợi thế giúp người nghe đa nhiệm multitasking vượt trội):</div>
                    <div class="topic-formula-text">
                        → In my view, the biggest advantage of listening to the radio is that it enables listeners to multitask. It allows us to <span class="formula-bracket-hl">[lợi ích - Vo]</span> while driving or doing household chores.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "📻 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Thói quen nghe radio]:",
                        items: [
                            { en: "keep up to date with current affairs", vn: "cập nhật kịp thời các vấn đề thời sự" },
                            { en: "relax without straining our eyes on screens", vn: "thư giãn mà không gây căng thẳng mỏi mắt với màn hình" },
                            { en: "enables listeners to multitask efficiently", vn: "cho phép người nghe làm nhiều việc đồng thời hiệu quả" },
                            { en: "gain useful knowledge cost-effectively", vn: "thu thập kiến thức hữu ích một cách tiết kiệm chi phí" },
                            { en: "stimulate auditory imagination", vn: "kích thích khả năng tưởng tượng qua âm thanh" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp thêm các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>pass the time, clear my mind, broaden my horizons, stay well-informed...</em>).`
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Cập nhật thời sự & Thư giãn cho mắt không nhìn màn hình)",
                        text: "Listening to the radio brings us a number of significant benefits. For example, it allows us to keep up to date with current affairs and gives us a chance to relax without straining our eyes on electronic screens.",
                        formatted: `→ Listening to the radio brings us a number of significant benefits. For example, it allows us to <span class="sub-hl">keep up to date with current affairs</span> and gives us a chance to <span class="sub-hl">relax without straining our eyes on electronic screens</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Khả năng đa nhiệm khi vừa làm việc nhà vừa nghe thông tin)",
                        text: "In my view, the biggest advantage of listening to the radio is that it enables listeners to multitask. It allows us to gain useful information and enjoy pleasant music while driving or doing household chores.",
                        formatted: `→ In my view, the biggest advantage of listening to the radio is that it <span class="sub-hl">enables listeners to multitask</span>. It allows us to <span class="sub-hl">gain useful information</span> and <span class="sub-hl">enjoy pleasant music while driving or doing household chores</span>.`
                    }
                ]
            }
        ]
    }
];

// ==========================================================================
// TOPIC SELECTION & RENDERING CONTROLLER
// ==========================================================================
window.switchPracticeTopic = (topicId) => {
    renderPracticeTopic(parseInt(topicId));
};

window.setTopicSelectionMode = (mode) => {
    const manualBtn = document.getElementById('topic-mode-manual-btn');
    const randomBtn = document.getElementById('topic-mode-random-btn');
    const manualPanel = document.getElementById('topic-manual-panel');
    const randomPanel = document.getElementById('topic-random-panel');

    if (mode === 'manual') {
        if (manualBtn) manualBtn.classList.add('active');
        if (randomBtn) randomBtn.classList.remove('active');
        if (manualPanel) manualPanel.style.display = 'block';
        if (randomPanel) randomPanel.style.display = 'none';
    } else {
        if (manualBtn) manualBtn.classList.remove('active');
        if (randomBtn) randomBtn.classList.add('active');
        if (manualPanel) manualPanel.style.display = 'none';
        if (randomPanel) randomPanel.style.display = 'block';
        pickRandomPracticeTopic();
    }
};

window.pickRandomPracticeTopic = () => {
    const available = practiceTopicsData.map(t => t.id);
    if (!available || available.length === 0) return;

    const selectEl = document.getElementById('practice-topic-select');
    const currentId = selectEl ? parseInt(selectEl.value) : 1;

    let nextId = currentId;
    if (available.length > 1) {
        const pool = available.filter(id => id !== currentId);
        nextId = pool[Math.floor(Math.random() * pool.length)];
    } else {
        nextId = available[0];
    }

    renderPracticeTopic(nextId);

    // Confetti celebration
    if (typeof confetti === 'function') {
        try {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.3 }
            });
        } catch (e) {}
    }
};

function renderPracticeTopic(topicId) {
    const container = document.getElementById('practice-topic-content');
    if (!container) return;
    
    const topic = practiceTopicsData.find(t => t.id === topicId) || practiceTopicsData[0];
    if (!topic) return;

    const labelEl = document.getElementById('current-topic-label');
    if (labelEl) labelEl.textContent = `Topic ${String(topic.id).padStart(2, '0')} / 60`;

    const selectEl = document.getElementById('practice-topic-select');
    if (selectEl) selectEl.value = String(topic.id);

    const randomDisplayEl = document.getElementById('random-topic-title-display');
    if (randomDisplayEl) randomDisplayEl.textContent = topic.title;

    let html = `
        <div class="f-card-clean fade-in" style="margin-bottom: 2rem;">
            <div style="background: linear-gradient(135deg, rgba(67, 97, 238, 0.08), rgba(58, 12, 163, 0.05)); border: 2px solid rgba(67, 97, 238, 0.2); border-radius: 20px; padding: 1.5rem 1.75rem; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem;">
                    <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.6rem;">
                        <i class="fa-solid fa-comments"></i> ${topic.title}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                        <button class="btn-audio-sample" onclick="speakText('${(topic.introText || topic.intro || '').replace(/'/g, "\\'")}')" style="background: var(--primary);">
                            <i class="fa-solid fa-volume-high"></i> Nghe Câu Dẫn
                        </button>
                        <button class="btn-audio-sample" onclick="openFullTopicExamModal(${topic.id})" style="background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);">
                            <i class="fa-solid fa-stopwatch"></i> Thi Thử Cả Chủ Đề (90s)
                        </button>
                    </div>
                </div>
                <div style="font-size: 1.05rem; color: var(--text-main); line-height: 1.7; font-style: italic; background: var(--bg-card); padding: 0.85rem 1.25rem; border-radius: 12px; border: 1px dashed var(--border);">
                    🗣️ Câu dẫn của thí sinh: <strong>"${topic.introText || topic.intro || ''}"</strong>
                </div>
            </div>
    `;

    topic.questions.forEach((q) => {
        // Build suggestions HTML
        let vocabHtml = '';
        q.vocabGroups.forEach(vg => {
            if (vg.type === 'note' || vg.note) {
                vocabHtml += `
                    <div style="margin-bottom: 1.25rem; background: rgba(67, 97, 238, 0.05); border-left: 4px solid var(--primary); padding: 0.85rem 1.15rem; border-radius: 12px; border: 1px solid rgba(67, 97, 238, 0.15); border-left-width: 4px;">
                        <div style="font-weight: 800; font-size: 0.95rem; color: var(--primary); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
                            ${vg.title}
                        </div>
                        <div style="font-size: 0.95rem; line-height: 1.65; color: var(--text-main);">
                            ${vg.note}
                        </div>
                    </div>
                `;
            } else if (vg.items && vg.items.length > 0) {
                let itemsHtml = vg.items.map(it => `
                    <div class="topic-vocab-list-item" onclick="speakText('${it.en.replace(/'/g, "\\'")}')" title="Nhấn để nghe phát âm">
                        <i class="fa-solid fa-volume-high vocab-audio-icon"></i>
                        <strong class="vocab-en">${it.en}</strong>
                        <span class="vocab-colon">:</span>
                        <span class="vocab-vn">${it.vn}</span>
                    </div>
                `).join('');

                vocabHtml += `
                    <div style="margin-bottom: 1.25rem;">
                        <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.4rem;">${vg.title}</div>
                        <div class="topic-vocab-list">${itemsHtml}</div>
                    </div>
                `;
            }
        });

        // Build samples HTML
        let samplesHtml = q.samples.map((s) => `
            <div style="background: var(--bg-body); border-radius: 14px; padding: 1.25rem; border: 1px solid var(--border); margin-bottom: 1rem;">
                <div style="font-weight: 800; color: #7c3aed; font-size: 0.95rem; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-star"></i> ${s.label}:
                </div>
                <div class="ex-text" style="font-size: 1.05rem; line-height: 1.85; color: var(--text-main); font-weight: 500; margin-bottom: 0.85rem; text-align: justify; text-justify: inter-word;">
                    ${s.formatted}
                </div>
                <button class="btn-audio-sample" onclick="speakText('${s.text.replace(/'/g, "\\'")}')" style="background: #8b5cf6;">
                    <i class="fa-solid fa-volume-high"></i> Nghe Audio bài mẫu
                </button>
            </div>
        `).join('');

        html += `
            <div class="topic-q-card fade-in">
                <!-- Question Header -->
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
                    <div>
                        <div class="topic-q-badge">
                            <i class="fa-solid fa-circle-question"></i> CÂU HỎI ${q.qNum} / 3
                        </div>
                        <span class="topic-q-type-badge">
                            <i class="fa-solid fa-tag"></i> ${q.qType}
                        </span>
                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.5rem; line-height: 1.5;">
                            ${q.question}
                        </div>
                    </div>
                    <button class="icon-btn" onclick="speakText('${q.question.replace(/'/g, "\\'")}')" title="Nghe phát âm câu hỏi" style="flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; background: rgba(67, 97, 238, 0.1); color: var(--primary); border: 1.5px solid rgba(67, 97, 238, 0.25);">
                        <i class="fa-solid fa-volume-high" style="font-size: 1.1rem;"></i>
                    </button>
                </div>

                <!-- 1. GỢI Ý CÁCH TRẢ LỜI -->
                <div class="topic-section-box" style="border-color: rgba(59, 130, 246, 0.4); box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.08);">
                    <div class="topic-section-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'" style="background: rgba(59, 130, 246, 0.08); color: #2563eb;">
                        <span><i class="fa-solid fa-lightbulb" style="color: #2563eb;"></i> 💡 GỢI Ý CÁCH TRẢ LỜI</span>
                        <span style="font-size: 0.85rem; font-weight: 600;"><i class="fa-solid fa-chevron-down"></i></span>
                    </div>
                    <div class="topic-section-content" style="background: rgba(59, 130, 246, 0.02);">
                        <div class="f-formula-box" style="margin: 0; padding: 0.5rem 0; background: transparent; border: none;">
                            ${q.formula}
                        </div>
                    </div>
                </div>

                <!-- 2. GỢI Ý TỪ VỰNG -->
                <div class="topic-section-box" style="border-color: rgba(245, 158, 11, 0.4); box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.08);">
                    <div class="topic-section-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'" style="background: rgba(245, 158, 11, 0.08); color: #d97706;">
                        <span><i class="fa-solid fa-pen-to-square" style="color: #d97706;"></i> 📝 GỢI Ý TỪ VỰNG</span>
                        <span style="font-size: 0.85rem; font-weight: 600;"><i class="fa-solid fa-chevron-down"></i></span>
                    </div>
                    <div class="topic-section-content">
                        ${vocabHtml}
                    </div>
                </div>

                <!-- 3. THỰC HÀNH NÓI & GHI ÂM TÍNH GIỜ (NHƯ LÚC THI) -->
                <div class="topic-section-box" style="border-color: rgba(239, 68, 68, 0.45); box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.08);">
                    <div class="topic-section-header" style="background: rgba(239, 68, 68, 0.08); color: #dc2626; cursor: default;">
                        <span><i class="fa-solid fa-microphone-lines" style="color: #dc2626;"></i> 🎙️ THỰC HÀNH NÓI & GHI ÂM TÍNH GIỜ (NHƯ LÚC THI)</span>
                        <span id="topic-q-phase-badge-${q.qNum}" class="topic-exam-phase-badge">⏱️ Sẵn sàng trả lời</span>
                    </div>
                    <div class="topic-section-content" style="background: var(--bg-card); padding: 1.25rem 1.35rem;">
                        <div class="topic-exam-recorder" style="margin-top: 0; border: none; box-shadow: none; padding: 0;">
                            <div class="topic-exam-top">
                                <div class="topic-exam-time-options">
                                    <span><i class="fa-regular fa-clock"></i> Thời gian nói:</span>
                                    <span style="font-weight: 800; color: #ef4444; font-size: 0.95rem; background: rgba(239, 68, 68, 0.08); padding: 0.25rem 0.75rem; border-radius: 50px; border: 1px solid rgba(239, 68, 68, 0.25);"><i class="fa-solid fa-stopwatch"></i> 25 giây / câu</span>
                                </div>
                                <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">
                                    💡 Máy tính sẽ phát tiếng <strong>Beep</strong> khi bắt đầu và <strong>Chuông</strong> khi hết giờ.
                                </div>
                            </div>

                            <div class="topic-exam-body">
                                <div class="topic-exam-timer-wrap">
                                    <div id="topic-q-digits-${q.qNum}" class="topic-exam-digits">00:25</div>
                                    <div id="topic-q-wave-${q.qNum}" class="topic-mic-wave">
                                        <div class="topic-mic-bar"></div>
                                        <div class="topic-mic-bar"></div>
                                        <div class="topic-mic-bar"></div>
                                        <div class="topic-mic-bar"></div>
                                        <div class="topic-mic-bar"></div>
                                        <div class="topic-mic-bar"></div>
                                        <div class="topic-mic-bar"></div>
                                        <div class="topic-mic-bar"></div>
                                        <span style="font-size: 0.78rem; font-weight: 700; color: #ef4444; margin-left: 0.25rem;">
                                            <span class="topic-recording-dot"></span> ĐANG THU ÂM
                                        </span>
                                    </div>
                                </div>

                                <div class="topic-exam-actions">
                                    <button type="button" id="btn-topic-start-${q.qNum}" class="btn-exam-rec start" onclick="startTopicQuestionRecording(${q.qNum})">
                                        <i class="fa-solid fa-microphone"></i> Bắt đầu nói & Ghi âm
                                    </button>
                                    <button type="button" id="btn-topic-stop-${q.qNum}" class="btn-exam-rec stop" onclick="stopTopicQuestionRecording(${q.qNum})" style="display: none;">
                                        <i class="fa-solid fa-square"></i> Dừng & Nộp bài
                                    </button>
                                    <button type="button" id="btn-topic-reset-${q.qNum}" class="btn-exam-rec reset" onclick="resetTopicQuestionRecording(${q.qNum})" style="display: none;">
                                        <i class="fa-solid fa-rotate-left"></i> Ghi âm lại
                                    </button>
                                </div>
                            </div>

                            <!-- Playback Box -->
                            <div id="topic-playback-box-${q.qNum}" class="topic-exam-playback" style="display: none;">
                                <audio id="topic-audio-player-${q.qNum}" controls class="topic-exam-audio-player"></audio>
                                <a id="btn-download-topic-q-${q.qNum}" class="btn-exam-download" download="VSTEP_Speaking_P1_Q${q.qNum}.webm">
                                    <i class="fa-solid fa-download"></i> Tải bài nói (.webm)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. GỢI Ý ĐÁP ÁN MẪU THAM KHẢO -->
                <div class="topic-section-box" style="border-color: rgba(139, 92, 246, 0.4); box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.08);">
                    <div class="topic-section-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'" style="background: rgba(139, 92, 246, 0.08); color: #7c3aed;">
                        <span><i class="fa-solid fa-star" style="color: #7c3aed;"></i> ⭐ GỢI Ý ĐÁP ÁN MẪU THAM KHẢO</span>
                        <span style="font-size: 0.85rem; font-weight: 600;"><i class="fa-solid fa-chevron-down"></i></span>
                    </div>
                    <div class="topic-section-content">
                        ${samplesHtml}
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// ==========================================================================
// EXAM AUDIO SYNTHESIZER & SOUND EFFECTS (Web Audio API)
// ==========================================================================
function playExamTone(freq, duration, type = 'sine') {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!window._examAudioCtx) {
            window._examAudioCtx = new AudioContext();
        }
        if (window._examAudioCtx.state === 'suspended') {
            window._examAudioCtx.resume();
        }
        const ctx = window._examAudioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn('Exam audio synth notice:', e);
    }
}

function playExamDoubleBeep() {
    playExamTone(880, 0.15);
    setTimeout(() => playExamTone(880, 0.15), 200);
}

function playExamTimeUpChime() {
    playExamTone(523.25, 0.15); // C5
    setTimeout(() => {
        playExamTone(659.25, 0.15); // E5
        setTimeout(() => {
            playExamTone(783.99, 0.35); // G5
        }, 120);
    }, 120);
}

function stopAllActiveRecordings() {
    if (window._topicTimers) {
        Object.keys(window._topicTimers).forEach(qNum => {
            if (window._topicTimers[qNum] && window._topicTimers[qNum].isRecording) {
                stopTopicQuestionRecording(qNum);
            }
        });
    }
    if (window._fullExamTimer && window._fullExamTimer.isRecording) {
        stopFullTopicRecording();
    }
}

// ==========================================================================
// TOPIC PRACTICE - TIMED AUDIO RECORDER ENGINE (PER-QUESTION: 25s)
// ==========================================================================
window._topicTimers = {};

window.setTopicQuestionTime = (qNum, seconds, btnEl) => {
    if (window._topicTimers[qNum] && window._topicTimers[qNum].isRecording) return;
    
    if (!window._topicTimers[qNum]) {
        window._topicTimers[qNum] = {};
    }
    window._topicTimers[qNum].totalTime = seconds;
    window._topicTimers[qNum].timeLeft = seconds;

    const digitsEl = document.getElementById(`topic-q-digits-${qNum}`);
    if (digitsEl) {
        const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
        const ss = String(seconds % 60).padStart(2, '0');
        digitsEl.textContent = `${mm}:${ss}`;
        digitsEl.classList.remove('warning', 'danger');
    }
};

window.startTopicQuestionRecording = async (qNum) => {
    stopAllActiveRecordings();

    const timerObj = window._topicTimers[qNum] || { totalTime: 25, timeLeft: 25 };
    window._topicTimers[qNum] = timerObj;
    timerObj.totalTime = 25;
    timerObj.timeLeft = 25;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        timerObj.stream = stream;

        let options = { mimeType: 'audio/webm' };
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
            if (!MediaRecorder.isTypeSupported('audio/webm') && MediaRecorder.isTypeSupported('audio/mp4')) {
                options = { mimeType: 'audio/mp4' };
            }
        }

        const recorder = new MediaRecorder(stream, options);
        timerObj.recorder = recorder;
        timerObj.chunks = [];

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                timerObj.chunks.push(e.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(timerObj.chunks, { type: recorder.mimeType || 'audio/webm' });
            if (timerObj.blobUrl) URL.revokeObjectURL(timerObj.blobUrl);
            timerObj.blobUrl = URL.createObjectURL(blob);

            const player = document.getElementById(`topic-audio-player-${qNum}`);
            const downloadBtn = document.getElementById(`btn-download-topic-q-${qNum}`);
            const playbackBox = document.getElementById(`topic-playback-box-${qNum}`);

            if (player) player.src = timerObj.blobUrl;
            if (downloadBtn) {
                downloadBtn.href = timerObj.blobUrl;
                const student = (document.getElementById('display-name')?.textContent || 'HocVien').trim().replace(/\s+/g, '_');
                downloadBtn.download = `VSTEP_B2_Speaking_P1_Q${qNum}_${student}.webm`;
            }
            if (playbackBox) playbackBox.style.display = 'flex';

            const badge = document.getElementById(`topic-q-phase-badge-${qNum}`);
            if (badge) {
                badge.className = 'topic-exam-phase-badge done';
                badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã hoàn thành bài nói';
            }

            const startBtn = document.getElementById(`btn-topic-start-${qNum}`);
            const stopBtn = document.getElementById(`btn-topic-stop-${qNum}`);
            const resetBtn = document.getElementById(`btn-topic-reset-${qNum}`);
            if (startBtn) startBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'inline-flex';

            const waveEl = document.getElementById(`topic-q-wave-${qNum}`);
            if (waveEl) waveEl.classList.remove('active');
        };

        playExamDoubleBeep();
        recorder.start(1000);
        timerObj.isRecording = true;

        const badge = document.getElementById(`topic-q-phase-badge-${qNum}`);
        if (badge) {
            badge.className = 'topic-exam-phase-badge recording';
            badge.innerHTML = '<span class="topic-recording-dot"></span> Đang ghi âm bài nói';
        }

        const waveEl = document.getElementById(`topic-q-wave-${qNum}`);
        if (waveEl) waveEl.classList.add('active');

        const startBtn = document.getElementById(`btn-topic-start-${qNum}`);
        const stopBtn = document.getElementById(`btn-topic-stop-${qNum}`);
        const resetBtn = document.getElementById(`btn-topic-reset-${qNum}`);
        const playbackBox = document.getElementById(`topic-playback-box-${qNum}`);
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'inline-flex';
        if (resetBtn) resetBtn.style.display = 'none';
        if (playbackBox) playbackBox.style.display = 'none';

        const digitsEl = document.getElementById(`topic-q-digits-${qNum}`);
        if (digitsEl) {
            digitsEl.textContent = '00:25';
            digitsEl.classList.remove('warning', 'danger');
        }

        timerObj.timerInterval = setInterval(() => {
            timerObj.timeLeft--;
            const cur = timerObj.timeLeft;
            if (digitsEl) {
                const mm = String(Math.floor(cur / 60)).padStart(2, '0');
                const ss = String(cur % 60).padStart(2, '0');
                digitsEl.textContent = `${mm}:${ss}`;

                if (cur <= 8 && cur > 3) {
                    digitsEl.classList.add('warning');
                } else if (cur <= 3) {
                    digitsEl.classList.remove('warning');
                    digitsEl.classList.add('danger');
                }
            }

            if (cur <= 0) {
                playExamTimeUpChime();
                stopTopicQuestionRecording(qNum);
            }
        }, 1000);

    } catch (err) {
        console.warn('Microphone permission error:', err);
        alert('⚠️ Không thể truy cập Microphone! Vui lòng cho phép trình duyệt truy cập micro để ghi âm bài nói.');
    }
};

window.stopTopicQuestionRecording = (qNum) => {
    const timerObj = window._topicTimers[qNum];
    if (!timerObj || !timerObj.isRecording) return;

    timerObj.isRecording = false;
    if (timerObj.timerInterval) {
        clearInterval(timerObj.timerInterval);
        timerObj.timerInterval = null;
    }

    if (timerObj.recorder && timerObj.recorder.state !== 'inactive') {
        try { timerObj.recorder.stop(); } catch(e) {}
    }

    if (timerObj.stream) {
        try { timerObj.stream.getTracks().forEach(t => t.stop()); } catch(e) {}
        timerObj.stream = null;
    }
};

window.resetTopicQuestionRecording = (qNum) => {
    const timerObj = window._topicTimers[qNum] || {};
    if (timerObj.isRecording) {
        stopTopicQuestionRecording(qNum);
    }
    timerObj.totalTime = 25;
    timerObj.timeLeft = 25;

    const digitsEl = document.getElementById(`topic-q-digits-${qNum}`);
    if (digitsEl) {
        digitsEl.textContent = '00:25';
        digitsEl.classList.remove('warning', 'danger');
    }

    const badge = document.getElementById(`topic-q-phase-badge-${qNum}`);
    if (badge) {
        badge.className = 'topic-exam-phase-badge';
        badge.innerHTML = '⏱️ Sẵn sàng trả lời';
    }

    const startBtn = document.getElementById(`btn-topic-start-${qNum}`);
    const stopBtn = document.getElementById(`btn-topic-stop-${qNum}`);
    const resetBtn = document.getElementById(`btn-topic-reset-${qNum}`);
    const playbackBox = document.getElementById(`topic-playback-box-${qNum}`);
    const waveEl = document.getElementById(`topic-q-wave-${qNum}`);

    if (startBtn) startBtn.style.display = 'inline-flex';
    if (stopBtn) stopBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
    if (playbackBox) playbackBox.style.display = 'none';
    if (waveEl) waveEl.classList.remove('active');
};

// ==========================================================================
// FULL TOPIC EXAM SIMULATION MODAL (3 Questions Continuous - 90s)
// ==========================================================================
window._fullExamTimer = {
    totalTime: 90,
    timeLeft: 90,
    isRecording: false,
    interval: null,
    recorder: null,
    chunks: [],
    stream: null,
    blobUrl: null
};

window.openFullTopicExamModal = (topicId) => {
    stopAllActiveRecordings();
    const topic = practiceTopicsData.find(t => t.id === topicId) || practiceTopicsData[0];
    if (!topic) return;

    let overlay = document.getElementById('topic-full-exam-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'topic-full-exam-overlay';
        overlay.className = 'topic-full-exam-overlay';
        document.body.appendChild(overlay);
    }

    const qListHtml = topic.questions.map(q => `
        <div style="background: var(--bg-body); border-radius: 12px; padding: 1rem 1.25rem; border: 1px solid var(--border); margin-bottom: 0.85rem;">
            <div style="font-weight: 800; color: var(--primary); font-size: 0.92rem; margin-bottom: 0.35rem;">
                CÂU HỎI ${q.qNum}:
            </div>
            <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); line-height: 1.5;">
                ${q.question}
            </div>
        </div>
    `).join('');

    overlay.innerHTML = `
        <div class="topic-full-exam-modal fade-in">
            <div class="topic-full-exam-header">
                <div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #ef4444; letter-spacing: 0.5px; text-transform: uppercase;">
                        <i class="fa-solid fa-microphone-lines"></i> VSTEP B2 EXAM SIMULATION • SPEAKING PART 01
                    </div>
                    <div class="topic-full-exam-title">
                        ${topic.title}
                    </div>
                </div>
                <button class="topic-full-exam-close" onclick="closeFullTopicExamModal()" title="Đóng phòng thi">&times;</button>
            </div>

            <div style="margin-bottom: 1.25rem;">
                <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem;">
                    📋 NỘI DUNG 3 CÂU HỎI BẠN CẦN TRẢ LỜI LIÊN TỤC:
                </div>
                ${qListHtml}
            </div>

            <!-- Exam Console -->
            <div style="background: var(--bg-body); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 1.5rem; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted);">Thời gian thi:</span>
                    <button type="button" class="btn-time-opt" onclick="setFullExamTime(60, this)">60s</button>
                    <button type="button" class="btn-time-opt active" onclick="setFullExamTime(90, this)">90s (Chuẩn 1 Chủ Đề B2)</button>
                    <button type="button" class="btn-time-opt" onclick="setFullExamTime(180, this)">180s (3 Phút - Cả Part 1)</button>
                </div>

                <div id="full-exam-badge" class="topic-exam-phase-badge" style="margin-bottom: 1rem;">
                    ⏱️ SẴN SÀNG VÀO THI
                </div>

                <div style="display: flex; align-items: center; justify-content: center; gap: 1.25rem; margin-bottom: 1.25rem;">
                    <div id="full-exam-digits" class="topic-exam-digits" style="font-size: 3.5rem;">01:30</div>
                    <div id="full-exam-wave" class="topic-mic-wave">
                        <div class="topic-mic-bar"></div>
                        <div class="topic-mic-bar"></div>
                        <div class="topic-mic-bar"></div>
                        <div class="topic-mic-bar"></div>
                        <div class="topic-mic-bar"></div>
                        <div class="topic-mic-bar"></div>
                        <div class="topic-mic-bar"></div>
                        <div class="topic-mic-bar"></div>
                        <span style="font-size: 0.8rem; font-weight: 700; color: #ef4444; margin-left: 0.3rem;">
                            <span class="topic-recording-dot"></span> ĐANG THU ÂM
                        </span>
                    </div>
                </div>

                <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
                    <button type="button" id="btn-full-start" class="btn-exam-rec start" onclick="startFullTopicRecording(${topic.id})">
                        <i class="fa-solid fa-play"></i> Bắt đầu thi thử & Ghi âm
                    </button>
                    <button type="button" id="btn-full-stop" class="btn-exam-rec stop" onclick="stopFullTopicRecording()" style="display: none;">
                        <i class="fa-solid fa-square"></i> Nộp bài & Dừng thi
                    </button>
                    <button type="button" id="btn-full-reset" class="btn-exam-rec reset" onclick="resetFullTopicRecording()" style="display: none;">
                        <i class="fa-solid fa-rotate-left"></i> Thi lại
                    </button>
                </div>

                <div id="full-exam-playback" class="topic-exam-playback" style="display: none; justify-content: center;">
                    <audio id="full-exam-player" controls class="topic-exam-audio-player"></audio>
                    <a id="full-exam-download" class="btn-exam-download" download="VSTEP_B2_Speaking_P1_Topic_${topic.id}.webm">
                        <i class="fa-solid fa-download"></i> Tải bài thi của bạn (.webm)
                    </a>
                </div>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';
};

window.closeFullTopicExamModal = () => {
    if (window._fullExamTimer && window._fullExamTimer.isRecording) {
        stopFullTopicRecording();
    }
    const overlay = document.getElementById('topic-full-exam-overlay');
    if (overlay) overlay.style.display = 'none';
};

window.setFullExamTime = (seconds, btnEl) => {
    if (window._fullExamTimer.isRecording) return;
    window._fullExamTimer.totalTime = seconds;
    window._fullExamTimer.timeLeft = seconds;
    if (btnEl && btnEl.parentElement) {
        btnEl.parentElement.querySelectorAll('.btn-time-opt').forEach(b => b.classList.remove('active'));
        btnEl.classList.add('active');
    }
    const digitsEl = document.getElementById('full-exam-digits');
    if (digitsEl) {
        const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
        const ss = String(seconds % 60).padStart(2, '0');
        digitsEl.textContent = `${mm}:${ss}`;
        digitsEl.classList.remove('warning', 'danger');
    }
};

window.startFullTopicRecording = async (topicId) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        window._fullExamTimer.stream = stream;

        let options = { mimeType: 'audio/webm' };
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
            if (!MediaRecorder.isTypeSupported('audio/webm') && MediaRecorder.isTypeSupported('audio/mp4')) {
                options = { mimeType: 'audio/mp4' };
            }
        }

        const recorder = new MediaRecorder(stream, options);
        window._fullExamTimer.recorder = recorder;
        window._fullExamTimer.chunks = [];

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                window._fullExamTimer.chunks.push(e.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(window._fullExamTimer.chunks, { type: recorder.mimeType || 'audio/webm' });
            if (window._fullExamTimer.blobUrl) URL.revokeObjectURL(window._fullExamTimer.blobUrl);
            window._fullExamTimer.blobUrl = URL.createObjectURL(blob);

            const player = document.getElementById('full-exam-player');
            const downloadBtn = document.getElementById('full-exam-download');
            const playbackBox = document.getElementById('full-exam-playback');

            if (player) player.src = window._fullExamTimer.blobUrl;
            if (downloadBtn) {
                downloadBtn.href = window._fullExamTimer.blobUrl;
                const student = (document.getElementById('display-name')?.textContent || 'HocVien').trim().replace(/\s+/g, '_');
                downloadBtn.download = `VSTEP_B2_Speaking_P1_Topic${topicId}_${student}.webm`;
            }
            if (playbackBox) playbackBox.style.display = 'flex';

            const badge = document.getElementById('full-exam-badge');
            if (badge) {
                badge.className = 'topic-exam-phase-badge done';
                badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> ĐÃ HOÀN THÀNH BÀI THI 🎉';
            }

            const startBtn = document.getElementById('btn-full-start');
            const stopBtn = document.getElementById('btn-full-stop');
            const resetBtn = document.getElementById('btn-full-reset');
            if (startBtn) startBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'inline-flex';

            const wave = document.getElementById('full-exam-wave');
            if (wave) wave.classList.remove('active');
        };

        playExamDoubleBeep();
        recorder.start(1000);
        window._fullExamTimer.isRecording = true;

        const badge = document.getElementById('full-exam-badge');
        if (badge) {
            badge.className = 'topic-exam-phase-badge recording';
            badge.innerHTML = '<span class="topic-recording-dot"></span> HỆ THỐNG ĐANG GHI ÂM BÀI NÓI CỦA BẠN';
        }

        const wave = document.getElementById('full-exam-wave');
        if (wave) wave.classList.add('active');

        const startBtn = document.getElementById('btn-full-start');
        const stopBtn = document.getElementById('btn-full-stop');
        const resetBtn = document.getElementById('btn-full-reset');
        const playback = document.getElementById('full-exam-playback');
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'inline-flex';
        if (resetBtn) resetBtn.style.display = 'none';
        if (playback) playback.style.display = 'none';

        const digitsEl = document.getElementById('full-exam-digits');
        window._fullExamTimer.timeLeft = window._fullExamTimer.totalTime || 90;

        window._fullExamTimer.interval = setInterval(() => {
            window._fullExamTimer.timeLeft--;
            const cur = window._fullExamTimer.timeLeft;
            if (digitsEl) {
                const mm = String(Math.floor(cur / 60)).padStart(2, '0');
                const ss = String(cur % 60).padStart(2, '0');
                digitsEl.textContent = `${mm}:${ss}`;

                if (cur <= 20 && cur > 5) {
                    digitsEl.classList.add('warning');
                } else if (cur <= 5) {
                    digitsEl.classList.remove('warning');
                    digitsEl.classList.add('danger');
                }
            }

            if (cur <= 0) {
                playExamTimeUpChime();
                stopFullTopicRecording();
            }
        }, 1000);

    } catch (err) {
        console.warn('Full exam mic error:', err);
        alert('⚠️ Không thể truy cập Microphone! Vui lòng cho phép quyền truy cập micro.');
    }
};

window.stopFullTopicRecording = () => {
    if (!window._fullExamTimer.isRecording) return;
    window._fullExamTimer.isRecording = false;
    if (window._fullExamTimer.interval) {
        clearInterval(window._fullExamTimer.interval);
        window._fullExamTimer.interval = null;
    }
    if (window._fullExamTimer.recorder && window._fullExamTimer.recorder.state !== 'inactive') {
        try { window._fullExamTimer.recorder.stop(); } catch(e) {}
    }
    if (window._fullExamTimer.stream) {
        try { window._fullExamTimer.stream.getTracks().forEach(t => t.stop()); } catch(e) {}
        window._fullExamTimer.stream = null;
    }
};

window.resetFullTopicRecording = () => {
    if (window._fullExamTimer.isRecording) {
        stopFullTopicRecording();
    }
    window._fullExamTimer.timeLeft = window._fullExamTimer.totalTime || 90;
    const digitsEl = document.getElementById('full-exam-digits');
    if (digitsEl) {
        const mm = String(Math.floor(window._fullExamTimer.timeLeft / 60)).padStart(2, '0');
        const ss = String(window._fullExamTimer.timeLeft % 60).padStart(2, '0');
        digitsEl.textContent = `${mm}:${ss}`;
        digitsEl.classList.remove('warning', 'danger');
    }

    const badge = document.getElementById('full-exam-badge');
    if (badge) {
        badge.className = 'topic-exam-phase-badge';
        badge.innerHTML = '⏱️ SẴN SÀNG VÀO THI';
    }

    const startBtn = document.getElementById('btn-full-start');
    const stopBtn = document.getElementById('btn-full-stop');
    const resetBtn = document.getElementById('btn-full-reset');
    const playback = document.getElementById('full-exam-playback');
    const wave = document.getElementById('full-exam-wave');

    if (startBtn) startBtn.style.display = 'inline-flex';
    if (stopBtn) stopBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
    if (playback) playback.style.display = 'none';
    if (wave) wave.classList.remove('active');
};

// Auto-initialize topic 1 on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof renderPracticeTopic === 'function') renderPracticeTopic(1);
    });
} else {
    if (typeof renderPracticeTopic === 'function') renderPracticeTopic(1);
}

