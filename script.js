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
        if (state.userRole === 'teacher') {
            displayName.innerHTML = '<i class="fa-solid fa-chalkboard-user"></i> Giáo viên: PTMN (GV)';
        } else {
            displayName.textContent = val;
        }
        const roleLabel = userProfile?.querySelector('.label');
        if (roleLabel) {
            roleLabel.textContent = state.userRole === 'teacher' ? 'Giáo viên' : 'Học viên • Lớp B212';
        }
        userProfile.classList.remove('hidden');
        welcomeModal.style.opacity = '0';
        setTimeout(() => welcomeModal.classList.add('hidden'), 300);

        if (typeof window.applyClassPermissions === 'function') {
            window.applyClassPermissions();
        }
    };

    // Luôn luôn hiển thị modal đăng nhập mỗi khi tải lại trang / refresh
    window._currentUserRole = 'student';
    window._currentClass = 'B212';
    if (welcomeModal) {
        welcomeModal.classList.remove('hidden');
        welcomeModal.style.display = 'flex';
        welcomeModal.style.opacity = '1';
    }
    if (userProfile) {
        userProfile.classList.add('hidden');
    }
    if (studentInput) studentInput.value = '';
    if (studentClassInput) studentClassInput.value = '';
    if (loginError) loginError.style.display = 'none';

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

        if ((formattedClass === 'GV' || formattedClass === 'GV2026') && !isTeacher) {
            loginError.textContent = 'Mã lớp GV chỉ dành riêng cho tài khoản Giáo viên (PTMN)!';
            loginError.style.display = 'block';
            return;
        }

        if (isTeacher) {
            state.studentName = 'PTMN';
            state.studentClass = 'GV';
            state.userRole = 'teacher';
            state.accessLevel = 'FULL';
            window._currentUserRole = 'teacher';
            window._currentClass = 'GV';
        } else if (formattedClass === 'B212') {
            // Check student list for class B212
            const matchedStudent = validStudentsB212.find(s => {
                return normalizeStr(s) === normName;
            });

            if (!matchedStudent) {
                loginError.textContent = 'Họ và tên không thuộc danh sách lớp. Vui lòng kiểm tra lại!';
                loginError.style.display = 'block';
                return;
            }
            state.studentName = matchedStudent;
            state.studentClass = 'B212';
            state.userRole = 'student';
            state.accessLevel = 'B212';
            window._currentUserRole = 'student';
            window._currentClass = 'B212';
        } else {
            loginError.textContent = 'Mã lớp không hợp lệ. Vui lòng kiểm tra lại!';
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
                                        "a": "→ I usually read books when I'm free because I find it a great way to widen my knowledge. It also allows me to develop my imagination, so I can feel inspired.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>read books</strong> when I <strong>'m free</strong> because I find it a great way to <strong>widen my knowledge</strong>. It also allows me to <strong>develop my imagination</strong>, so I can feel <strong>inspired</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do when you <span class='sub-hl'>feel bored</span>?",
                                        "a": "→ I usually watch comedy movies when I feel bored because I find it a great way to have fun. It also allows me to pass the time, so I can feel refreshed.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>watch comedy movies</strong> when I <strong>feel bored</strong> because I find it a great way to <strong>have fun</strong>. It also allows me to <strong>pass the time</strong>, so I can feel <strong>refreshed</strong>.</div>"
                                },
                                {
                                        "q": "What do you often do when you <span class='sub-hl'>are tired</span>?",
                                        "a": "→ I usually take a short nap when I'm tired because I find it a great way to regain my energy. It also allows me to rest my eyes, so I can feel re-energized.",
                                        "f": "<div style='margin-bottom: 8px;'><strong>- Trả lời:</strong> → I usually <strong>take a short nap</strong> when I <strong>'m tired</strong> because I find it a great way to <strong>regain my energy</strong>. It also allows me to <strong>rest my eyes</strong>, so I can feel <strong>re-energized</strong>.</div>"
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
                        → <u>One of my favorite hobbies is</u> <span class="formula-bracket-hl">[sở thích - V-ing / danh từ]</span> because I find it both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
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
                        title: "🌟 [Cấu trúc diễn đạt sở thích / đam mê]:",
                        items: [
                            { en: "I'm a big fan of", vn: "Tôi là một người rất hâm mộ / cực kỳ mê (+ V-ing / Danh từ)" },
                            { en: "I'm really into", vn: "Tôi thật sự rất say mê / thích (+ V-ing / Danh từ)" },
                            { en: "I'm really keen on", vn: "Tôi rất hứng thú / say sưa với (+ V-ing / Danh từ)" },
                            { en: "I have a strong passion for", vn: "Tôi có niềm đam mê mãnh liệt đối với (+ V-ing / Danh từ)" },
                            { en: "One of my favorite hobbies is", vn: "Một trong những sở thích tôi yêu thích nhất là..." },
                            { en: "I'm particularly fond of", vn: "Tôi đặc biệt yêu thích / chuộng (+ V-ing / Danh từ)" }
                        ]
                    },
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
                        title: "✨ [Kho tính từ mô tả]:",
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
                        formatted: `→ <u>One of my favorite hobbies is</u> <span class="sub-hl">reading self-help books</span> because I find it both <span class="sub-hl">entertaining and educational</span>. It allows me to <span class="sub-hl">unwind after a tiring day</span> and gives me a chance to <span class="sub-hl">broaden my horizons</span>.`
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
                        title: "💡 [Lý do đồng hành]:",
                        items: [
                            { en: "we share similar interests", vn: "chúng tôi có chung sở thích" },
                            { en: "we have a lot in common", vn: "chúng tôi có nhiều điểm tương đồng" },
                            { en: "we want to spend quality time together", vn: "chúng tôi muốn dành thời gian chất lượng bên nhau" },
                            { en: "they always motivate and support me", vn: "họ luôn thúc đẩy và ủng hộ tôi" },
                            { en: "it's a great way to stay connected", vn: "đó là cách tuyệt vời để giữ gắn kết" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ so sánh hơn]:",
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
                        → <u>One of my favorite video games is</u> <span class="formula-bracket-hl">[tên trò chơi]</span> because I find it both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
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
                        title: "🌟 [Cấu trúc diễn đạt sở thích / đam mê]:",
                        items: [
                            { en: "I'm a big fan of", vn: "Tôi là một người rất hâm mộ / cực kỳ mê (+ V-ing / Danh từ)" },
                            { en: "I'm really into", vn: "Tôi thật sự rất say mê / thích (+ V-ing / Danh từ)" },
                            { en: "I'm really keen on", vn: "Tôi rất hứng thú / say sưa với (+ V-ing / Danh từ)" },
                            { en: "I have a strong passion for", vn: "Tôi có niềm đam mê mãnh liệt đối với (+ V-ing / Danh từ)" },
                            { en: "One of my favorite video games is", vn: "Một trong những trò chơi điện tử tôi thích nhất là..." },
                            { en: "I'm particularly fond of", vn: "Tôi đặc biệt yêu thích / chuộng (+ V-ing / Danh từ)" }
                        ]
                    },
                    {
                        title: "🎮 [Tên trò chơi & thể loại]:",
                        items: [
                            { en: "Candy Crush", vn: "trò chơi xếp kẹo giải đố Candy Crush" },
                            { en: "Township", vn: "game xây dựng thành phố và nông trại Township" },
                            { en: "Play Together", vn: "game thế giới ảo vui nhộn kết nối bạn bè" },
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
                        formatted: `→ <u>One of my favorite video games is</u> <span class="sub-hl">online chess</span> because I find it both <span class="sub-hl">entertaining and mentally stimulating</span>. It allows me to <span class="sub-hl">unwind after a busy day</span> and gives me a chance to <span class="sub-hl">sharpen my tactical thinking</span>.`
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
                        → Personally, I prefer playing video games <span class="formula-bracket-hl">[hình thức lựa chọn]</span> because I find it much more <span class="formula-bracket-hl">[tính từ so sánh hơn]</span>. It allows <span class="formula-bracket-hl">[me / us]</span> to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives <span class="formula-bracket-hl">[me / us]</span> a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cấu trúc nhượng bộ Although - Đánh giá cao cả hai nhưng nghiêng về một bên):</div>
                    <div class="topic-formula-text">
                        → Although playing <span class="formula-bracket-hl">[hình thức nhượng bộ]</span> has its own merits, I still lean towards playing <span class="formula-bracket-hl">[hình thức lựa chọn]</span> because it's far more <span class="formula-bracket-hl">[tính từ so sánh hơn]</span>. It allows <span class="formula-bracket-hl">[me / us]</span> to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "✨ [Tính từ so sánh hơn]:",
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
                        → <u>One of my all-time favorite books is</u> <span class="formula-bracket-hl">[tên cuốn sách]</span> because I find it both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Khẳng định đam mê với thể loại sách, rồi nêu tác phẩm tâm đắc):</div>
                    <div class="topic-formula-text">
                        → Well, <u>I have a strong passion for reading</u> <span class="formula-bracket-hl">[thể loại sách]</span>, and the book that impresses me the most is <span class="formula-bracket-hl">[tên cuốn sách]</span>. It offers profound insights and helps me <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt sở thích / đam mê]:",
                        items: [
                            { en: "I'm a big fan of", vn: "Tôi là một người rất hâm mộ / cực kỳ mê (+ V-ing / Danh từ)" },
                            { en: "I'm really into", vn: "Tôi thật sự rất say mê / chuộng (+ V-ing / Danh từ)" },
                            { en: "I'm really keen on", vn: "Tôi rất hứng thú / say sưa với (+ V-ing / Danh từ)" },
                            { en: "I have a strong passion for", vn: "Tôi có niềm đam mê mãnh liệt đối với (+ V-ing / Danh từ)" },
                            { en: "One of my all-time favorite books is", vn: "Một trong những cuốn sách tôi thích nhất từ trước đến nay là (+ Tên sách)" },
                            { en: "I'm particularly fond of", vn: "Tôi đặc biệt yêu thích / chuộng (+ V-ing / Danh từ)" }
                        ]
                    },
                    {
                        title: "📖 [Tên tác phẩm & sách tiêu biểu]:",
                        items: [
                            { en: "The Little Prince", vn: "Hoàng tử bé (Antoine de Saint-Exupéry)" },
                            { en: "The Alchemist", vn: "Nhà giả kim (Paulo Coelho)" },
                            { en: "Atomic Habits", vn: "Thói quen nguyên tử (James Clear)" },
                            { en: "Rich Dad Poor Dad", vn: "Cha giàu cha nghèo (Robert Kiyosaki)" },
                            { en: "Harry Potter series", vn: "Bộ tiểu thuyết Harry Potter (J.K. Rowling)" },
                            { en: "Sherlock Holmes", vn: "Tuyển tập truyện trinh thám Sherlock Holmes" },
                            { en: "Diary of a Wimpy Kid", vn: "Nhật ký chú bé nhút nhát (Jeff Kinney)" },
                            { en: "Doraemon comics", vn: "Truyện tranh Doraemon" },
                            { en: "How to Win Friends and Influence People", vn: "Đắc Nhân Tâm (Dale Carnegie)" },
                            { en: "To Kill a Mockingbird", vn: "Giết con chim nhại (Harper Lee)" }
                        ]
                    },
                    {
                        title: "✨ [Kho tính từ mô tả sách]:",
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
                        formatted: `→ <u>One of my all-time favorite books is</u> <span class="sub-hl">The Alchemist</span> because I find it both <span class="sub-hl">inspiring and thought-provoking</span>. It allows me to <span class="sub-hl">broaden my horizons</span> and gives me an opportunity to <span class="sub-hl">pursue my personal dreams with courage</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Atomic Habits - Sách phát triển bản thân & Xây dựng thói quen tốt)",
                        text: "Well, I have a strong passion for reading self-help books, and the book that impresses me the most is Atomic Habits. It offers profound insights and helps me cultivate good habits while breaking harmful ones.",
                        formatted: `→ Well, <u>I have a strong passion for reading</u> <span class="sub-hl">self-help books</span>, and the book that impresses me the most is <span class="sub-hl">Atomic Habits</span>. It offers profound insights and helps me <span class="sub-hl">cultivate good habits while breaking harmful ones</span>.`
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
                        → Personally, I prefer reading <span class="formula-bracket-hl">[loại sách lựa chọn]</span> because I find them much more <span class="formula-bracket-hl">[tính từ so sánh hơn]</span>. They allow me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and give me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cân bằng cả hai - Mỗi loại đều sở hữu lợi ích riêng biệt):</div>
                    <div class="topic-formula-text">
                        → In my opinion, both types of books have their own benefits. Paper books help me <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span>, while e-books allow me to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span> whenever I'm on the go.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "📚 [Loại sách lựa chọn]:",
                        items: [
                            { en: "paper books", vn: "sách giấy truyền thống" },
                            { en: "e-books", vn: "sách điện tử" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ so sánh hơn]:",
                        items: [
                            { en: "more convenient", vn: "tiện lợi / thuận tiện hơn" },
                            { en: "cheaper", vn: "rẻ hơn / tiết kiệm hơn" },
                            { en: "easier to read", vn: "dễ đọc hơn" },
                            { en: "more comfortable", vn: "thoải mái / dễ chịu hơn" },
                            { en: "lighter", vn: "nhẹ hơn (dễ cầm trên tay)" },
                            { en: "more interesting", vn: "thú vị / hấp dẫn hơn" },
                            { en: "more portable", vn: "gọn nhẹ / dễ mang theo hơn" },
                            { en: "more practical", vn: "thiết thực / tiện dụng hơn" },
                            { en: "more affordable", vn: "giá cả phải chăng / kinh tế hơn" },
                            { en: "more authentic", vn: "chân thực / mang cảm giác truyền thống hơn" }
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
                        label: "Bài mẫu Cách 1 (Chọn sách giấy - Thoải mái cho mắt & Tập trung sâu)",
                        text: "Personally, I prefer reading paper books because I find them much more comfortable. They allow me to concentrate deeply without digital distractions and give me the authentic pleasure of turning real pages.",
                        formatted: `→ Personally, I prefer reading <span class="sub-hl">paper books</span> because I find them much more <span class="sub-hl">comfortable</span>. They allow me to <span class="sub-hl">concentrate deeply without digital distractions</span> and give me the authentic pleasure of turning real pages.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cân bằng cả hai - Sách giấy ở nhà & E-book khi di chuyển)",
                        text: "In my opinion, both types of books have their own benefits. Paper books help me protect my eyes and focus better, while e-books allow me to access hundreds of titles easily whenever I'm on the go.",
                        formatted: `→ In my opinion, <span class="sub-hl">both types of books have their own benefits</span>. Paper books help me <span class="sub-hl">protect my eyes and focus better</span>, while e-books allow me to <span class="sub-hl">access hundreds of titles easily whenever I'm on the go</span>.`
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
                        → Not really. I rarely listen to traditional radio because I prefer digital platforms like <span class="formula-bracket-hl">[nền tảng số]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
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
                        text: "Sure. I often listen to the radio on my daily commute whenever I'm on the road. It allows me to catch up on traffic updates and gives me a chance to enjoy cheerful music to start my day.",
                        formatted: `→ Sure. I often listen to the radio <span class="sub-hl">on my daily commute</span> whenever I'm on the road. It allows me to <span class="sub-hl">catch up on traffic updates</span> and gives me a chance to <span class="sub-hl">enjoy cheerful music to start my day</span>.`
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
                        → Well, I regularly tune in to <span class="formula-bracket-hl">[tên kênh quốc tế]</span> because it's extremely <span class="formula-bracket-hl">[tính từ mô tả]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
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
                        text: "Well, I regularly tune in to BBC World Service because it's extremely educational. It allows me to hone my English listening skills and gives me an opportunity to keep abreast of global news.",
                        formatted: `→ Well, I regularly tune in to <span class="sub-hl">BBC World Service</span> because it's extremely <span class="sub-hl">educational</span>. It allows me to <span class="sub-hl">hone my English listening skills</span> and gives me an opportunity to <span class="sub-hl">keep abreast of global news</span>.`
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
    },
    {
        id: 5,
        title: "Chủ đề 05: Let's talk about music",
        introText: "Let’s talk about music.",
        questions: [
            {
                qNum: 1,
                question: "What kind of music do you like?",
                qType: "Wh-question: What kind of music do you like?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Nêu thể loại nhạc yêu thích & 2 tính từ mô tả chuẩn B2):</div>
                    <div class="topic-formula-text">
                        → <u>One of my favorite music genres is</u> <span class="formula-bracket-hl">[thể loại nhạc]</span> because I find it both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cấu trúc linh hoạt tùy theo tâm trạng - It largely depends on my mood):</div>
                    <div class="topic-formula-text">
                        → Well, <u>it largely depends on my mood</u>. When I need to unwind, I prefer listening to <span class="formula-bracket-hl">[thể loại nhẹ nhàng]</span> because it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span>. However, when I lack energy, I listen to <span class="formula-bracket-hl">[thể loại sôi động]</span>, which gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt sở thích / đam mê]:",
                        items: [
                            { en: "I'm a big fan of", vn: "Tôi là một người rất hâm mộ / cực kỳ mê (+ V-ing / Danh từ)" },
                            { en: "I'm really into", vn: "Tôi thật sự rất say mê / chuộng (+ V-ing / Danh từ)" },
                            { en: "I'm really keen on", vn: "Tôi rất hứng thú / say sưa với (+ V-ing / Danh từ)" },
                            { en: "I have a strong passion for", vn: "Tôi có niềm đam mê mãnh liệt đối với (+ V-ing / Danh từ)" },
                            { en: "One of my favorite music genres is", vn: "Một trong những dòng nhạc tôi thích nhất là..." },
                            { en: "I'm particularly fond of", vn: "Tôi đặc biệt yêu thích / chuộng (+ V-ing / Danh từ)" }
                        ]
                    },
                    {
                        title: "🎵 [Thể loại âm nhạc phổ biến]:",
                        items: [
                            { en: "acoustic pop music", vn: "nhạc pop mộc mạc, nhẹ nhàng" },
                            { en: "classical piano pieces", vn: "nhạc dương cầm cổ điển êm dịu" },
                            { en: "upbeat EDM and dance tracks", vn: "nhạc điện tử sôi động, giàu năng lượng" },
                            { en: "lyrical ballads", vn: "nhạc ballad trữ tình, sâu lắng" },
                            { en: "smooth jazz", vn: "nhạc jazz du dương, thư thái" },
                            { en: "indie folk music", vn: "nhạc indie folk mộc mạc, đậm chất riêng" }
                        ]
                    },
                    {
                        title: "✨ [Kho tính từ mô tả âm nhạc]:",
                        items: [
                            { en: "soothing and melodic", vn: "êm dịu và du dương" },
                            { en: "catchy and cheerful", vn: "bắt tai và vui tươi" },
                            { en: "energetic and uplifting", vn: "tràn đầy năng lượng và phấn chấn" },
                            { en: "peaceful and relaxing", vn: "bình yên và thư thái" },
                            { en: "deeply emotional", vn: "giàu cảm xúc sâu sắc" },
                            { en: "inspiring", vn: "truyền cảm hứng mạnh mẽ" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp linh hoạt các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>unwind after an exhausting day, boost my mood, clear my mind, regain my vitality...</em>).`
                    },
                    {
                        title: "🎧 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Âm nhạc]:",
                        items: [
                            { en: "release negative emotions", vn: "giải tỏa cảm xúc tiêu cực" },
                            { en: "boost my energy levels", vn: "nâng cao mức năng lượng và sự hứng khởi" },
                            { en: "soothe my nervous system", vn: "xoa dịu hệ thần kinh và tâm trí" },
                            { en: "immerse myself in poetic lyrics", vn: "đắm chìm trong ca từ giàu chất thơ" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Nhạc pop acoustic - Du dương & Xoa dịu tâm trí)",
                        text: "One of my favorite music genres is acoustic pop music because I find it both soothing and melodic. It allows me to unwind after an exhausting day and gives me a chance to soothe my nervous system.",
                        formatted: `→ <u>One of my favorite music genres is</u> <span class="sub-hl">acoustic pop music</span> because I find it both <span class="sub-hl">soothing and melodic</span>. It allows me to <span class="sub-hl">unwind after an exhausting day</span> and gives me a chance to <span class="sub-hl">soothe my nervous system</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cấu trúc linh hoạt theo tâm trạng: It largely depends on my mood)",
                        text: "Well, it largely depends on my mood. When I need to unwind, I prefer listening to classical piano pieces because it allows me to clear my mind. However, when I lack energy, I listen to upbeat EDM tracks, which gives me an opportunity to boost my energy levels.",
                        formatted: `→ Well, <u>it largely depends on my mood</u>. When I need to unwind, I prefer listening to <span class="sub-hl">classical piano pieces</span> because it allows me to <span class="sub-hl">clear my mind</span>. However, when I lack energy, I listen to <span class="sub-hl">upbeat EDM tracks</span>, which gives me an opportunity to <span class="sub-hl">boost my energy levels</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "When do you often listen to music?",
                qType: "Wh-question: When do you often listen to music?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Khẳng định thời điểm cụ thể & lý do thư giãn):</div>
                    <div class="topic-formula-text">
                        → I usually listen to music <span class="formula-bracket-hl">[thời điểm cụ thể]</span> because I find it extremely <span class="formula-bracket-hl">[tính từ]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cấu trúc kết hợp đa nhiệm khi làm việc khác - While + V-ing):</div>
                    <div class="topic-formula-text">
                        → In fact, <u>I tend to listen to music while</u> <span class="formula-bracket-hl">[hoạt động - V-ing]</span>. It creates an uplifting atmosphere that allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "⏰ [Thời điểm thích hợp] (Dành cho Cách 1):",
                        items: [
                            { en: "in the late evening before going to bed", vn: "vào đêm muộn trước khi đi ngủ" },
                            { en: "after an intensive study session", vn: "sau một buổi học tập căng thẳng" },
                            { en: "on peaceful weekend mornings", vn: "vào những buổi sáng cuối tuần yên tĩnh" },
                            { en: "during my lunch break", vn: "trong giờ nghỉ trưa" }
                        ]
                    },
                    {
                        title: "🎧 [Hoạt động kết hợp: While + V-ing] (Dành cho Cách 2):",
                        items: [
                            { en: "doing household chores", vn: "làm việc nhà (lau dọn, nấu ăn)" },
                            { en: "commuting on the bus or train", vn: "di chuyển trên xe buýt hoặc tàu hỏa" },
                            { en: "working out at the fitness center", vn: "tập luyện tại phòng tập thể hình" },
                            { en: "working on creative design tasks", vn: "làm các dự án thiết kế sáng tạo" }
                        ]
                    },
                    {
                        title: "✨ [Lợi ích khi nghe nhạc kết hợp]:",
                        items: [
                            { en: "drift off into deep sleep easily", vn: "dễ dàng chìm vào giấc ngủ sâu" },
                            { en: "turn tedious chores into enjoyable moments", vn: "biến việc nhà nhàm chán thành giây phút vui vẻ" },
                            { en: "maintain high endurance during workouts", vn: "duy trì sức bền dẻo dai khi tập luyện" },
                            { en: "block out distracting background noise", vn: "ngăn chặn tiếng ồn xung quanh gây xao nhãng" },
                            { en: "recharge mental batteries", vn: "nạp lại năng lượng cho tâm trí" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trước khi ngủ - Giải tỏa căng thẳng & Ngủ sâu)",
                        text: "I usually listen to music in the late evening before going to bed because I find it extremely relaxing. It allows me to release mental tension and gives me a chance to drift off into deep sleep easily.",
                        formatted: `→ I usually listen to music <span class="sub-hl">in the late evening before going to bed</span> because I find it extremely <span class="sub-hl">relaxing</span>. It allows me to <span class="sub-hl">release mental tension</span> and gives me a chance to <span class="sub-hl">drift off into deep sleep easily</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cấu trúc kết hợp: Vừa di chuyển hoặc làm việc nhà vừa nghe nhạc)",
                        text: "In fact, I tend to listen to music while commuting on the bus or doing household chores. It creates an uplifting atmosphere that allows me to block out distracting noise and gives me an opportunity to turn tedious chores into enjoyable moments.",
                        formatted: `→ In fact, <u>I tend to listen to music while</u> <span class="sub-hl">commuting on the bus or doing household chores</span>. It creates an uplifting atmosphere that allows me to <span class="sub-hl">block out distracting noise</span> and gives me an opportunity to <span class="sub-hl">turn tedious chores into enjoyable moments</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Is music important to you? Why?",
                qType: "Yes/No Question: Is music important to you? Why?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Khẳng định vai trò thiết yếu không thể thiếu - plays an indispensable role):</div>
                    <div class="topic-formula-text">
                        → Yes, absolutely. <u>Music plays an indispensable role in my daily life</u> because it's both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cấu trúc giả định giàu cảm xúc - I can't imagine my life without music):</div>
                    <div class="topic-formula-text">
                        → Without a doubt, <u>I can't imagine my life without music</u>. It acts as an incredible emotional therapy that allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "✨ [Tính từ khẳng định giá trị]:",
                        items: [
                            { en: "indispensable", vn: "không thể thiếu / tối quan trọng" },
                            { en: "therapeutic", vn: "mang tính trị liệu tâm hồn" },
                            { en: "enriching", vn: "làm phong phú đời sống tinh thần" },
                            { en: "uplifting", vn: "nâng đỡ tinh thần / truyền cảm hứng tích cực" },
                            { en: "essential", vn: "thiết yếu và cần thiết" }
                        ]
                    },
                    {
                        title: "🌟 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Giá trị của âm nhạc]:",
                        items: [
                            { en: "heal emotional exhaustion and reduce anxiety", vn: "xoa dịu sự kiệt quệ cảm xúc và giảm bớt âu lo" },
                            { en: "stay motivated in demanding situations", vn: "giữ vững động lực trong những hoàn cảnh khó khăn" },
                            { en: "foster creative imagination and reflection", vn: "nuôi dưỡng trí tưởng tượng sáng tạo và sự chiêm nghiệm" },
                            { en: "connect deeply with my inner emotions", vn: "kết nối sâu sắc với thế giới cảm xúc nội tâm" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Vai trò thiết yếu - Trị liệu tinh thần & Giữ vững động lực)",
                        text: "Yes, absolutely. Music plays an indispensable role in my daily life because it's both therapeutic and uplifting. It allows me to heal emotional exhaustion and gives me a chance to stay motivated in demanding situations.",
                        formatted: `→ Yes, absolutely. <u>Music plays an indispensable role in my daily life</u> because it's both <span class="sub-hl">therapeutic and uplifting</span>. It allows me to <span class="sub-hl">heal emotional exhaustion</span> and gives me a chance to <span class="sub-hl">stay motivated in demanding situations</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Không thể tưởng tượng cuộc sống thiếu âm nhạc - Trị liệu cảm xúc)",
                        text: "Without a doubt, I can't imagine my life without music. It acts as an incredible emotional therapy that allows me to escape from daily pressure and gives me an opportunity to connect deeply with my inner emotions.",
                        formatted: `→ Without a doubt, <u>I can't imagine my life without music</u>. It acts as an incredible <span class="sub-hl">emotional therapy</span> that allows me to <span class="sub-hl">escape from daily pressure</span> and gives me an opportunity to <span class="sub-hl">connect deeply with my inner emotions</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 6,
        title: "Chủ đề 06: Let's talk about musical instruments",
        introText: "Let’s talk about musical instruments.",
        questions: [
            {
                qNum: 1,
                question: "Can you play any musical instruments?",
                qType: "Can you question: Can you play any musical instruments?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Đã biết chơi một nhạc cụ & chia sẻ trải nghiệm bổ ích):</div>
                    <div class="topic-formula-text">
                        → Yes, definitely. <u>I've learned to play</u> <span class="formula-bracket-hl">[tên nhạc cụ]</span> for <span class="formula-bracket-hl">[khoảng thời gian]</span> because I find it really <span class="formula-bracket-hl">[tính từ]</span>. Playing it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Chưa biết chơi nhưng rất mong muốn học nhạc cụ mong ước):</div>
                    <div class="topic-formula-text">
                        → To be honest, <u>I haven't had the chance to master any musical instruments yet</u>. However, <u>I've always wanted to take up</u> <span class="formula-bracket-hl">[tên nhạc cụ]</span> because it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🎻 [Tên các nhạc cụ phổ biến]:",
                        items: [
                            { en: "the acoustic guitar", vn: "đàn ghi-ta mộc" },
                            { en: "the piano", vn: "đàn dương cầm" },
                            { en: "the violin", vn: "đàn vĩ cầm" },
                            { en: "the ukulele", vn: "đàn ukulele nhỏ gọn" },
                            { en: "the drums", vn: "bộ trống sôi động" },
                            { en: "the flute", vn: "sáo trúc / sáo tây" }
                        ]
                    },
                    {
                        title: "✨ [Kho tính từ mô tả việc chơi nhạc cụ]:",
                        items: [
                            { en: "rewarding", vn: "rất bổ ích và xứng đáng với công sức" },
                            { en: "mentally stimulating", vn: "kích thích tư duy và não bộ" },
                            { en: "emotionally fulfilling", vn: "thỏa mãn về mặt cảm xúc tinh thần" },
                            { en: "challenging yet exciting", vn: "đầy thử thách nhưng vô cùng hào hứng" },
                            { en: "relaxing", vn: "thư giãn và thanh thản" }
                        ]
                    },
                    {
                        title: "🎼 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Chơi nhạc cụ]:",
                        items: [
                            { en: "express personal feelings musically", vn: "bày tỏ cảm xúc cá nhân qua âm nhạc" },
                            { en: "improve hand-eye coordination and patience", vn: "rèn luyện sự khéo léo phối hợp tay mắt và tính kiên nhẫn" },
                            { en: "enter a state of deep relaxation", vn: "tiến vào trạng thái thư thái sâu lắng" },
                            { en: "stimulate brain neuroplasticity", vn: "kích thích các liên kết thần kinh và sự nhạy bén của não" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Đã biết chơi đàn guitar - Bày tỏ cảm xúc & Giải tỏa áp lực)",
                        text: "Yes, definitely. I've learned to play the acoustic guitar for a couple of years because I find it really rewarding. Playing it allows me to express my personal feelings and gives me a chance to unwind after stressful study hours.",
                        formatted: `→ Yes, definitely. <u>I've learned to play</u> <span class="sub-hl">the acoustic guitar</span> for <span class="sub-hl">a couple of years</span> because I find it really <span class="sub-hl">rewarding</span>. Playing it allows me to <span class="sub-hl">express my personal feelings</span> and gives me a chance to <span class="sub-hl">unwind after stressful study hours</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Chưa biết chơi - Mong muốn học piano để rèn tính kiên nhẫn)",
                        text: "To be honest, I haven't had the chance to master any musical instruments yet. However, I've always wanted to take up the piano because it allows me to improve patience and gives me an opportunity to enter a state of deep relaxation.",
                        formatted: `→ To be honest, <u>I haven't had the chance to master any musical instruments yet</u>. However, <u>I've always wanted to take up</u> <span class="sub-hl">the piano</span> because it allows me to <span class="sub-hl">improve patience</span> and gives me an opportunity to <span class="sub-hl">enter a state of deep relaxation</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "What musical instrument do you like best?",
                qType: "Wh-question: What musical instrument do you like best?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Nêu nhạc cụ yêu thích nhất & 2 tính từ âm thanh B2):</div>
                    <div class="topic-formula-text">
                        → <u>One of my favorite musical instruments is</u> <span class="formula-bracket-hl">[tên nhạc cụ]</span> because I find its sound both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. Listening to it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Bị cuốn hút bởi tính biểu cảm và sự đa năng):</div>
                    <div class="topic-formula-text">
                        → Well, <u>I'm particularly fascinated by</u> <span class="formula-bracket-hl">[tên nhạc cụ]</span> due to its rich and versatile sounds. It allows listeners to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives them an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt sở thích]:",
                        items: [
                            { en: "I'm a big fan of", vn: "Tôi là người rất hâm mộ (+ Tên nhạc cụ)" },
                            { en: "I'm particularly fascinated by", vn: "Tôi đặc biệt bị cuốn hút bởi (+ Tên nhạc cụ)" },
                            { en: "One of my favorite musical instruments is", vn: "Một trong những nhạc cụ tôi thích nhất là..." },
                            { en: "I have a special admiration for", vn: "Tôi có niềm ái mộ đặc biệt dành cho..." }
                        ]
                    },
                    {
                        title: "🎶 [Tính từ mô tả âm thanh nhạc cụ]:",
                        items: [
                            { en: "melodic and soothing", vn: "du dương và êm dịu" },
                            { en: "powerful and resonant", vn: "mạnh mẽ và vang vọng" },
                            { en: "versatile and expressive", vn: "đa dạng phong phú và giàu sức biểu cảm" },
                            { en: "gentle and heart-warming", vn: "nhẹ nhàng và ấm áp" }
                        ]
                    },
                    {
                        title: "🎵 [Lợi ích khi thưởng thức âm thanh nhạc cụ]:",
                        items: [
                            { en: "immerse myself in peaceful melodies", vn: "đắm chìm trong những giai điệu yên ả" },
                            { en: "soothe nervous feelings after a hectic week", vn: "xoa dịu cảm giác bồn chồn lo âu sau một tuần bận rộn" },
                            { en: "connect emotionally with beautiful harmonies", vn: "kết nối cảm xúc với những hòa âm tuyệt đẹp" },
                            { en: "appreciate fine musical craftsmanship", vn: "cảm nhận chiều sâu nghệ thuật âm nhạc tinh tế" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Đàn Piano - Du dương, êm dịu & Đắm chìm thư thái)",
                        text: "One of my favorite musical instruments is the piano because I find its sound both melodic and soothing. Listening to it allows me to immerse myself in peaceful melodies and gives me a chance to soothe nervous feelings after a hectic week.",
                        formatted: `→ <u>One of my favorite musical instruments is</u> <span class="sub-hl">the piano</span> because I find its sound both <span class="sub-hl">melodic and soothing</span>. Listening to it allows me to <span class="sub-hl">immerse myself in peaceful melodies</span> and gives me a chance to <span class="sub-hl">soothe nervous feelings after a hectic week</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Đàn Guitar acoustic - Âm thanh mộc mạc & Kết nối cảm xúc)",
                        text: "Well, I'm particularly fascinated by the acoustic guitar due to its rich and versatile sounds. It allows listeners to connect emotionally with beautiful harmonies and gives them an opportunity to enjoy cozy acoustic evenings.",
                        formatted: `→ Well, <u>I'm particularly fascinated by</u> <span class="sub-hl">the acoustic guitar</span> due to its <span class="sub-hl">rich and versatile sounds</span>. It allows listeners to <span class="sub-hl">connect emotionally with beautiful harmonies</span> and gives them an opportunity to <span class="sub-hl">enjoy cozy acoustic evenings</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Do you think children should learn to play musical instruments?",
                qType: "Do you think question: Do you think children should learn to play musical instruments?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Khẳng định tuyệt đối nên học & đưa ra 2 lợi ích phát triển nhân cách):</div>
                    <div class="topic-formula-text">
                        → Yes, wholeheartedly. <u>I strongly advocate that children should learn to play a musical instrument</u> because it's both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span> for their development. It allows them to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives them a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cấu trúc đảo ngữ nhấn mạnh lợi ích kép - Not only does it allow children to... but it also...):</div>
                    <div class="topic-formula-text">
                        → From my perspective, learning an instrument is of paramount importance for kids. <u>Not only does it allow children to</u> <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span>, <u>but it also gives them an opportunity to</u> <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "✨ [Tính từ mô tả tầm quan trọng]:",
                        items: [
                            { en: "beneficial and enriching", vn: "vô cùng có ích và làm giàu đời sống tâm hồn" },
                            { en: "character-building", vn: "rèn luyện tính cách và nhân phẩm" },
                            { en: "crucial for cognitive development", vn: "thiết yếu cho sự phát triển nhận thức" },
                            { en: "constructive", vn: "mang tính xây dựng cao" }
                        ]
                    },
                    {
                        title: "👶 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Lợi ích cho trẻ em]:",
                        items: [
                            { en: "cultivate self-discipline and perseverance", vn: "rèn luyện tính kỷ luật tự giác và sự kiên trì" },
                            { en: "boost cognitive brain development and memory", vn: "thúc đẩy sự phát triển nhận thức và trí nhớ của não bộ" },
                            { en: "foster creative imagination and aesthetic appreciation", vn: "nuôi dưỡng trí tưởng tượng sáng tạo và khả năng cảm thụ cái đẹp" },
                            { en: "develop fine motor skills and hand-eye coordination", vn: "phát triển kỹ năng vận động tinh và sự phối hợp tay mắt" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Ủng hộ nhiệt tình - Rèn luyện tính kỷ luật & Phát triển trí não)",
                        text: "Yes, wholeheartedly. I strongly advocate that children should learn to play a musical instrument because it's both beneficial and character-building for their development. It allows them to cultivate self-discipline and gives them a chance to boost cognitive brain development.",
                        formatted: `→ Yes, wholeheartedly. <u>I strongly advocate that children should learn to play a musical instrument</u> because it's both <span class="sub-hl">beneficial and character-building</span> for their development. It allows them to <span class="sub-hl">cultivate self-discipline</span> and gives them a chance to <span class="sub-hl">boost cognitive brain development</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cấu trúc đảo ngữ: Vừa nuôi dưỡng sáng tạo vừa rèn sự kiên nhẫn)",
                        text: "From my perspective, learning an instrument is of paramount importance for kids. Not only does it allow children to foster creative imagination, but it also gives them an opportunity to cultivate perseverance and aesthetic appreciation.",
                        formatted: `→ From my perspective, learning an instrument is of paramount importance for kids. <u>Not only does it allow children to</u> <span class="sub-hl">foster creative imagination</span>, <u>but it also gives them an opportunity to</u> <span class="sub-hl">cultivate perseverance and aesthetic appreciation</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 7,
        title: "Chủ đề 07: Let's talk about restaurants",
        introText: "Let’s talk about restaurants.",
        questions: [
            {
                qNum: 1,
                question: "What restaurant do you often go to? Why do you go there?",
                qType: "Wh-question: What restaurant do you often go to? Why do you go there?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Nhà hàng quen thuộc - Không gian ấm cúng & ẩm thực tinh tế):</div>
                    <div class="topic-formula-text">
                        → <u>Whenever I have the opportunity to dine out, I tend to visit</u> <span class="formula-bracket-hl">[loại nhà hàng / tên quán]</span> near my <span class="formula-bracket-hl">[địa điểm]</span> because I find its ambience both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. Dining there allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Quán ăn yêu thích - Thực đơn phong phú & giá cả hợp lý):</div>
                    <div class="topic-formula-text">
                        → <u>One of my all-time favorite restaurants is</u> <span class="formula-bracket-hl">[loại nhà hàng / tên quán]</span> located near my <span class="formula-bracket-hl">[địa điểm]</span>. It offers <span class="formula-bracket-hl">[điểm nổi bật]</span>, which allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt thói quen & lựa chọn]:",
                        items: [
                            { en: "Whenever I have the opportunity to dine out, I tend to visit", vn: "Mỗi khi có dịp đi ăn bên ngoài, tôi thường ghé đến..." },
                            { en: "One of my all-time favorite restaurants is", vn: "Một trong những nhà hàng tôi thích nhất từ trước đến nay là..." },
                            { en: "I have a particular preference for", vn: "Tôi có niềm yêu thích đặc biệt dành cho..." },
                            { en: "My go-to dining spot is", vn: "Địa điểm ăn uống quen thuộc / quán ruột của tôi là..." }
                        ]
                    },
                    {
                        title: "🍽️ [Loại hình quán ăn & Vị trí]:",
                        items: [
                            { en: "a cozy Vietnamese restaurant", vn: "quán ăn ẩm thực Việt ấm cúng" },
                            { en: "a local seafood eatery", vn: "quán hải sản tươi sống địa phương" },
                            { en: "a traditional noodle house", vn: "quán bún / phở truyền thống" },
                            { en: "a vibrant BBQ and hotpot bistro", vn: "quán nướng và lẩu sôi động" },
                            { en: "near my residence / workplace", vn: "gần nơi cư trú / nơi làm việc của tôi" }
                        ]
                    },
                    {
                        title: "✨ [Kho tính từ mô tả nhà hàng B2]:",
                        items: [
                            { en: "welcoming and elegant", vn: "hiếu khách và tao nhã / lịch sự" },
                            { en: "spacious and comfortable", vn: "rộng rãi và thoải mái" },
                            { en: "cozy and tranquil", vn: "ấm cúng và yên bình" },
                            { en: "scrumptious and wholesome", vn: "thơm ngon hảo hạng và lành mạnh" },
                            { en: "attentive and courteous", vn: "chu đáo tận tình và lịch sự (phục vụ)" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>unwind after an exhausting workday, socialize with friends, strengthen family bonding...</em>).`
                    },
                    {
                        title: "🍷 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Đi ăn ngoài]:",
                        items: [
                            { en: "savor mouth-watering culinary delights", vn: "thưởng thức những món ăn ngon miệng tuyệt hảo" },
                            { en: "enjoy a peaceful dining atmosphere", vn: "tận hưởng bầu không khí ăn uống yên bình" },
                            { en: "strengthen family bonding over meals", vn: "thắt chặt sự gắn kết gia đình qua bữa ăn" },
                            { en: "explore diverse gastronomic specialties", vn: "khám phá nhiều món ngon đặc sản phong phú" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Quán ăn Việt ấm cúng gần nhà - Món ăn ngon & Gắn kết gia đình)",
                        text: "Whenever I have the opportunity to dine out, I tend to visit a cozy Vietnamese restaurant near my residence because I find its ambience both welcoming and elegant. Dining there allows me to savor mouth-watering culinary delights and gives me a chance to strengthen family bonding over delicious meals.",
                        formatted: `→ <u>Whenever I have the opportunity to dine out, I tend to visit</u> <span class="sub-hl">a cozy Vietnamese restaurant near my residence</span> because I find its ambience both <span class="sub-hl">welcoming and elegant</span>. Dining there allows me to <span class="sub-hl">savor mouth-watering culinary delights</span> and gives me a chance to <span class="sub-hl">strengthen family bonding over delicious meals</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Quán hải sản gần nơi làm việc - Thực đơn đa dạng & Giao lưu đồng nghiệp)",
                        text: "One of my all-time favorite restaurants is a local seafood eatery located near my workplace. It offers a remarkably diverse menu at affordable prices, which allows me to unwind after an exhausting workday and gives me an opportunity to socialize with my colleagues.",
                        formatted: `→ <u>One of my all-time favorite restaurants is</u> <span class="sub-hl">a local seafood eatery located near my workplace</span>. It offers <span class="sub-hl">a remarkably diverse menu at affordable prices</span>, which allows me to <span class="sub-hl">unwind after an exhausting workday</span> and gives me an opportunity to <span class="sub-hl">socialize with my colleagues</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "What types of food are served at that restaurant?",
                qType: "Wh-question: What types of food are served at that restaurant?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Đặc sản truyền thống Việt Nam với hương vị đậm đà):</div>
                    <div class="topic-formula-text">
                        → That restaurant specializes in <span class="formula-bracket-hl">[loại hình ẩm thực]</span>, featuring iconic specialties such as <span class="formula-bracket-hl">[món 1]</span> and <span class="formula-bracket-hl">[món 2]</span>. All the dishes are exceptionally <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Thực đơn hải sản tươi sống và phương pháp chế biến tinh tế):</div>
                    <div class="topic-formula-text">
                        → They offer an extensive selection of <span class="formula-bracket-hl">[loại món ăn]</span>, including <span class="formula-bracket-hl">[món 1]</span> and <span class="formula-bracket-hl">[món 2]</span>. What impresses me most is that every ingredient is <span class="formula-bracket-hl">[tính từ]</span>, which guarantees <span class="formula-bracket-hl">[giá trị mang lại]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🍲 [Món ăn & Ẩm thực đặc sắc]:",
                        items: [
                            { en: "traditional Vietnamese delicacies", vn: "các món đặc sản ẩm thực thuần Việt" },
                            { en: "fragrant beef noodle soup", vn: "phở bò thơm lừng đậm đà" },
                            { en: "crispy traditional spring rolls", vn: "nem rán / chả giò giòn rụm" },
                            { en: "savory charcoal-grilled pork with noodles", vn: "bún chả nướng than hoa thơm lừng" },
                            { en: "steamed tiger prawns with lemongrass", vn: "tôm sú hấp sả thơm nồng" },
                            { en: "simmered fish in a clay pot", vn: "cá kho tộ đậm đà thơm ngậy" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ mô tả hương vị & chất lượng]:",
                        items: [
                            { en: "flavorful and authentic", vn: "đậm đà hương vị và chuẩn vị truyền thống" },
                            { en: "freshly sourced and well-seasoned", vn: "nguyên liệu tươi sạch và nêm nếm khéo léo" },
                            { en: "crispy on the exterior", vn: "giòn tan ở lớp vỏ bên ngoài" },
                            { en: "nutritious and hygienic", vn: "bổ dưỡng và đảm bảo vệ sinh" }
                        ]
                    },
                    {
                        title: "🌿 [Lợi ích khi dùng bữa]:",
                        items: [
                            { en: "guarantees food safety and freshness", vn: "đảm bảo an toàn thực phẩm và độ tươi ngon" },
                            { en: "offers a memorable gastronomic experience", vn: "mang đến trải nghiệm ẩm thực đáng nhớ" },
                            { en: "caters to varied nutritional preferences", vn: "đáp ứng nhu cầu dinh dưỡng đa dạng" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Món ăn truyền thống - Phở bò và nem rán chuẩn vị)",
                        text: "That restaurant specializes in traditional Vietnamese delicacies, featuring iconic specialties such as fragrant beef noodle soup and crispy spring rolls. All the dishes are exceptionally flavorful and authentic, which offers diners a memorable gastronomic experience.",
                        formatted: `→ That restaurant specializes in <span class="sub-hl">traditional Vietnamese delicacies</span>, featuring iconic specialties such as <span class="sub-hl">fragrant beef noodle soup and crispy spring rolls</span>. All the dishes are exceptionally <span class="sub-hl">flavorful and authentic</span>, which offers diners <span class="sub-hl">a memorable gastronomic experience</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Hải sản tươi sống - Tôm hấp sả và cá kho tộ đậm đà)",
                        text: "They offer an extensive selection of fresh seafood dishes, including steamed tiger prawns with lemongrass and savory clay-pot fish. What impresses me most is that every ingredient is freshly sourced and well-seasoned, which guarantees food safety and exceptional taste.",
                        formatted: `→ They offer an extensive selection of <span class="sub-hl">fresh seafood dishes</span>, including <span class="sub-hl">steamed tiger prawns with lemongrass and savory clay-pot fish</span>. What impresses me most is that every ingredient is <span class="sub-hl">freshly sourced and well-seasoned</span>, which guarantees <span class="sub-hl">food safety and exceptional taste</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Do you like all the dishes there?",
                qType: "Choice question: Do you like all the dishes there?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Hài lòng với hầu hết các món - Hương vị hợp khẩu vị tuyệt đối):</div>
                    <div class="topic-formula-text">
                        → Generally speaking, <u>I relish almost every dish on their menu</u> because the seasoning caters perfectly to my palate, particularly <span class="formula-bracket-hl">[món yêu thích nhất]</span>. However, I tend to avoid <span class="formula-bracket-hl">[món không hợp]</span> because it's slightly <span class="formula-bracket-hl">[tính từ]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Khen ngợi chất lượng chung nhưng ưu tiên món thanh đạm dễ tiêu):</div>
                    <div class="topic-formula-text">
                        → While the vast majority of their offerings are outstanding, <u>I have a selective preference</u>. I consistently opt for <span class="formula-bracket-hl">[món thanh nhẹ]</span>, as it allows me to <span class="formula-bracket-hl">[lợi ích - Vo]</span> without feeling <span class="formula-bracket-hl">[cảm giác tiêu cực]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt khẩu vị & sự chọn lọc]:",
                        items: [
                            { en: "I relish almost every dish on their menu", vn: "Tôi thưởng thức ngon lành hầu hết các món trên menu" },
                            { en: "caters perfectly to my palate", vn: "phù hợp và chiều lòng khẩu vị của tôi một cách hoàn hảo" },
                            { en: "I have a selective preference for", vn: "Tôi có sự ưu tiên lựa chọn có chọn lọc đối với..." },
                            { en: "consistently opt for", vn: "luôn luôn ưu tiên lựa chọn..." }
                        ]
                    },
                    {
                        title: "🍽️ [Tính từ mô tả khẩu vị & món ăn]:",
                        items: [
                            { en: "richly flavored yet balanced", vn: "đậm đà hương vị nhưng vẫn hài hòa cân đối" },
                            { en: "overly spicy or greasy", vn: "quá cay hoặc quá nhiều dầu mỡ" },
                            { en: "wholesome and light", vn: "thanh đạm và nhẹ nhàng cho cơ thể" },
                            { en: "gentle on the digestion", vn: "dễ tiêu hóa và êm bụng" }
                        ]
                    },
                    {
                        title: "🥗 [Món ăn thanh đạm & Lợi ích]:",
                        items: [
                            { en: "lighter options like steamed vegetables", vn: "các lựa chọn thanh nhẹ như rau hấp" },
                            { en: "nourishing chicken soup", vn: "súp gà giàu dưỡng chất bồi bổ" },
                            { en: "avoid feeling excessively bloated", vn: "tránh cảm giác bị đầy hơi ậm ạch khó chịu" },
                            { en: "maintain a balanced digestive system", vn: "giữ cho hệ tiêu hóa luôn khỏe mạnh cân bằng" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Hợp khẩu vị hầu hết mọi món - Tránh món quá cay)",
                        text: "Generally speaking, I relish almost every dish on their menu because the culinary seasoning caters perfectly to my palate, particularly their signature beef noodles. However, I usually avoid overly spicy dishes because they can be slightly harsh on my stomach.",
                        formatted: `→ Generally speaking, <u>I relish almost every dish on their menu</u> because the culinary seasoning <span class="sub-hl">caters perfectly to my palate</span>, particularly their signature <span class="sub-hl">beef noodles</span>. However, I usually avoid <span class="sub-hl">overly spicy dishes</span> because they can be slightly harsh on my stomach.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Ưu tiên món thanh nhẹ - Rau hấp và súp gà dễ tiêu)",
                        text: "While the vast majority of their offerings are outstanding, I have a selective preference. I consistently opt for lighter options like steamed vegetables and chicken soup, as it allows me to enjoy a wholesome meal without feeling excessively bloated.",
                        formatted: `→ While the vast majority of their offerings are outstanding, <u>I have a selective preference</u>. I consistently opt for <span class="sub-hl">lighter options like steamed vegetables and chicken soup</span>, as it allows me to <span class="sub-hl">enjoy a wholesome meal without feeling excessively bloated</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 8,
        title: "Chủ đề 08: Let's talk about fast food restaurants",
        introText: "Let’s talk about fast food restaurants.",
        questions: [
            {
                qNum: 1,
                question: "Have you ever been to a fast food restaurant?",
                qType: "Have you ever question: Have you ever been to a fast food restaurant?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Đã từng đến - Thỉnh thoảng tụ tập bạn bè vì tiện lợi & nhanh chóng):</div>
                    <div class="topic-formula-text">
                        → Yes, occasionally. <u>Whenever I'm pressed for time or hanging out with my friends</u>, I drop by <span class="formula-bracket-hl">[tên chuỗi cửa hàng]</span> because it's both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. It allows us to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives us a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Hiếm khi - Ưu tiên cơm nhà vì sức khỏe và tiết kiệm):</div>
                    <div class="topic-formula-text">
                        → Yes, but only once in a blue moon. Nowadays, <u>I consciously prioritize wholesome home-cooked meals</u> because they're far more <span class="formula-bracket-hl">[tính từ]</span>. Preparing food at home allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt thói quen & tần suất]:",
                        items: [
                            { en: "Whenever I'm pressed for time or hanging out with my friends", vn: "Bất cứ khi nào tôi eo hẹp thời gian hoặc đi chơi cùng bạn..." },
                            { en: "only once in a blue moon", vn: "cực kỳ hiếm khi / năm thì mười họa" },
                            { en: "I consciously prioritize wholesome home-cooked meals", vn: "Tôi chủ động ưu tiên các bữa cơm nhà lành mạnh" },
                            { en: "drop by a fast food outlet", vn: "ghé vào một cửa hàng thức ăn nhanh" }
                        ]
                    },
                    {
                        title: "🍟 [Chuỗi cửa hàng thức ăn nhanh]:",
                        items: [
                            { en: "popular chains like KFC or Lotteria", vn: "các chuỗi nổi tiếng như KFC hoặc Lotteria" },
                            { en: "McDonald's or Burger King", vn: "chuỗi cửa hàng McDonald's hoặc Burger King" },
                            { en: "quick-service pizza outlets", vn: "các cửa hàng pizza phục vụ nhanh" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ mô tả dịch vụ & bữa ăn]:",
                        items: [
                            { en: "convenient and time-saving", vn: "tiện lợi và tiết kiệm thời gian" },
                            { en: "accessible and affordable", vn: "dễ tiếp cận và giá cả vừa phải" },
                            { en: "nutritious and hygienic", vn: "bổ dưỡng và đảm bảo vệ sinh (cơm nhà)" },
                            { en: "wholesome", vn: "lành mạnh và tốt cho sức khỏe" }
                        ]
                    },
                    {
                        title: "🥗 [Lợi ích khi dùng bữa]:",
                        items: [
                            { en: "grab a quick bite on busy days", vn: "ăn nhanh lót dạ trong những ngày bận rộn" },
                            { en: "catch up with friends in a lively atmosphere", vn: "trò chuyện hàn huyên cùng bạn bè trong không khí sôi động" },
                            { en: "control calorie intake effectively", vn: "kiểm soát lượng calo nạp vào hiệu quả" },
                            { en: "save substantial living expenses", vn: "tiết kiệm được đáng kể chi phí sinh hoạt" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Thỉnh thoảng đi KFC cùng bạn - Tiện lợi & Bắt kịp câu chuyện)",
                        text: "Yes, occasionally. Whenever I'm pressed for time or hanging out with my friends, I drop by KFC because it's both convenient and time-saving. It allows us to grab a quick bite and gives us a chance to catch up in a lively atmosphere.",
                        formatted: `→ Yes, occasionally. <u>Whenever I'm pressed for time or hanging out with my friends</u>, I drop by <span class="sub-hl">KFC</span> because it's both <span class="sub-hl">convenient and time-saving</span>. It allows us to <span class="sub-hl">grab a quick bite</span> and gives us a chance to <span class="sub-hl">catch up in a lively atmosphere</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Hiếm khi đi - Ưu tiên cơm nhà dinh dưỡng & Tiết kiệm chi phí)",
                        text: "Yes, but only once in a blue moon. Nowadays, I consciously prioritize wholesome home-cooked meals because they're far more nutritious and hygienic. Preparing food at home allows me to control calories and gives me an opportunity to save substantial expenses.",
                        formatted: `→ Yes, but <u>only once in a blue moon</u>. Nowadays, <u>I consciously prioritize wholesome home-cooked meals</u> because they're far more <span class="sub-hl">nutritious and hygienic</span>. Preparing food at home allows me to <span class="sub-hl">control calories</span> and gives me an opportunity to <span class="sub-hl">save substantial expenses</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "What is your favorite fast food?",
                qType: "Wh-question: What is your favorite fast food?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Món khoái khẩu - Hương vị giòn rụm & giải tỏa căng thẳng):</div>
                    <div class="topic-formula-text">
                        → <u>I'm a big fan of</u> <span class="formula-bracket-hl">[tên món ăn]</span> because I find its texture both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. Savoring it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Món ăn lý tưởng để chia sẻ cùng bạn bè dịp tụ họp):</div>
                    <div class="topic-formula-text">
                        → Without hesitation, <u>my top pick would be</u> <span class="formula-bracket-hl">[tên món ăn]</span>. It's exceptionally <span class="formula-bracket-hl">[tính từ]</span>, which makes it ideal for sharing with friends to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt niềm đam mê món ăn]:",
                        items: [
                            { en: "I'm a big fan of", vn: "Tôi là một người rất thích / mê (+ V-ing / Danh từ)" },
                            { en: "Without hesitation, my top pick would be", vn: "Không chút do dự, lựa chọn hàng đầu của tôi sẽ là..." },
                            { en: "Nothing compares to the pleasure of enjoying", vn: "Không gì sánh bằng cảm giác tuyệt vời khi thưởng thức..." }
                        ]
                    },
                    {
                        title: "🍗 [Món ăn nhanh hấp dẫn]:",
                        items: [
                            { en: "crispy golden fried chicken", vn: "gà rán vàng ươm giòn rụm" },
                            { en: "stuffed-crust cheese pizza", vn: "pizza viền phô mai béo ngậy thơm lừng" },
                            { en: "succulent beef burger with caramelized onions", vn: "burger bò mọng nước kèm hành tây xào thơm" },
                            { en: "seasoned French fries with garlic mayo", vn: "khoai tây chiên lắc gia vị chấm sốt béo ngậy" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ mô tả hương vị & độ ngon B2]:",
                        items: [
                            { en: "crunchy and delightfully juicy", vn: "giòn tan và mọng nước đầy mê hoặc" },
                            { en: "scrumptious and richly seasoned", vn: "thơm ngon hảo hạng và tẩm ướp đậm đà" },
                            { en: "piping hot and flavorful", vn: "nóng hổi vừa thổi vừa ăn và đậm vị" },
                            { en: "irresistible", vn: "hấp dẫn không thể cưỡng lại" }
                        ]
                    },
                    {
                        title: "🎉 [Lợi ích cảm xúc & Tinh thần]:",
                        items: [
                            { en: "satisfy my comfort food cravings", vn: "thỏa mãn cơn thèm món ăn khoái khẩu" },
                            { en: "instantly uplift my spirits after stressful exams", vn: "ngay lập tức vực dậy tinh thần sau các kỳ thi căng thẳng" },
                            { en: "foster joyful bonding moments with friends", vn: "tạo nên những giây phút gắn kết vui tươi bên bạn bè" },
                            { en: "celebrate pleasant weekend gatherings", vn: "kỷ niệm những buổi tụ họp cuối tuần ấm áp" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Gà rán giòn rụm - Thỏa mãn cơn thèm & Vực dậy tinh thần)",
                        text: "I'm a big fan of crispy golden fried chicken because I find its texture both crunchy and delightfully juicy. Savoring it allows me to satisfy my comfort food cravings and gives me a chance to instantly uplift my spirits after stressful exams.",
                        formatted: `→ <u>I'm a big fan of</u> <span class="sub-hl">crispy golden fried chicken</span> because I find its texture both <span class="sub-hl">crunchy and delightfully juicy</span>. Savoring it allows me to <span class="sub-hl">satisfy my comfort food cravings</span> and gives me a chance to <span class="sub-hl">instantly uplift my spirits after stressful exams</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Pizza phô mai - Đậm đà thơm ngậy & Gắn kết bạn bè)",
                        text: "Without hesitation, my top pick would be hot cheese pizza. It's exceptionally scrumptious and richly seasoned, which makes it ideal for sharing with friends to foster bonding moments and celebrate pleasant weekend gatherings.",
                        formatted: `→ Without hesitation, <u>my top pick would be</u> <span class="sub-hl">hot cheese pizza</span>. It's exceptionally <span class="sub-hl">scrumptious and richly seasoned</span>, which makes it ideal for sharing with friends to <span class="sub-hl">foster bonding moments and celebrate pleasant weekend gatherings</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Is it healthy to eat fast food?",
                qType: "Is it healthy question: Is it healthy to eat fast food?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Khẳng định tác hại lớn đến sức khỏe - Nhiều chất béo xấu & calo rỗng):</div>
                    <div class="topic-formula-text">
                        → Definitely not. From a nutritional standpoint, <u>frequent consumption of fast food poses severe health risks</u> because it's laden with <span class="formula-bracket-hl">[chất béo / phụ gia độc hại]</span>. It can lead to <span class="formula-bracket-hl">[tác hại 1]</span> and significantly increases the risk of <span class="formula-bracket-hl">[tác hại 2]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Cấu trúc nhượng bộ tương phản - Tiện lợi tức thì nhưng hại lâu dài):</div>
                    <div class="topic-formula-text">
                        → Although fast food is undeniably convenient and tasty, <u>it's detrimental to long-term well-being</u>. Therefore, it's advisable to <span class="formula-bracket-hl">[biện pháp lành mạnh]</span> in order to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "⚠️ [Thành phần có hại trong fast food]:",
                        items: [
                            { en: "saturated fats and excessive sodium", vn: "chất béo bão hòa và lượng muối natri dư thừa" },
                            { en: "refined sugars and chemical additives", vn: "đường tinh luyện và các chất phụ gia hóa học" },
                            { en: "empty calories lacking essential vitamins", vn: "lượng calo rỗng thiếu hụt các vitamin thiết yếu" },
                            { en: "trans fats and deep-frying oils", vn: "chất béo chuyển hóa và dầu mỡ chiên đi chiên lại" }
                        ]
                    },
                    {
                        title: "⚡ [Tác hại nghiêm trọng đối với sức khỏe]:",
                        items: [
                            { en: "rapid weight gain and obesity", vn: "tăng cân nhanh chóng và béo phì" },
                            { en: "cardiovascular diseases and hypertension", vn: "các bệnh tim mạch và cao huyết áp" },
                            { en: "elevated cholesterol and blood sugar levels", vn: "tăng lượng mỡ máu cholesterol và đường huyết" },
                            { en: "chronic digestive complications", vn: "các biến chứng rối loạn tiêu hóa mãn tính" }
                        ]
                    },
                    {
                        title: "🥦 [Biện pháp & Lối sống lành mạnh B2]:",
                        items: [
                            { en: "prioritize nutrient-rich home-cooked meals", vn: "ưu tiên các bữa cơm nhà tự nấu giàu dưỡng chất" },
                            { en: "maintain optimal metabolic health", vn: "duy trì sức khỏe trao đổi chất ở trạng thái tối ưu" },
                            { en: "prevent chronic lifestyle-related illnesses", vn: "phòng ngừa các bệnh lý mãn tính do lối sống" },
                            { en: "embrace a wholesome Mediterranean-style diet", vn: "áp dụng chế độ ăn uống lành mạnh phong phú rau xanh" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Khẳng định nguy hại - Nhiều mỡ xấu và muối, gây béo phì & bệnh tim)",
                        text: "Definitely not. From a nutritional standpoint, frequent consumption of fast food poses severe health risks because it's laden with saturated fats and excessive sodium. Overeating fast food can lead to rapid weight gain and significantly increases the risk of cardiovascular diseases.",
                        formatted: `→ Definitely not. From a nutritional standpoint, <u>frequent consumption of fast food poses severe health risks</u> because it's laden with <span class="sub-hl">saturated fats and excessive sodium</span>. Overeating fast food can lead to <span class="sub-hl">rapid weight gain</span> and significantly increases the risk of <span class="sub-hl">cardiovascular diseases</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cấu trúc tương phản Although - Ưu tiên cơm nhà để duy trì sức khỏe)",
                        text: "Although fast food is undeniably convenient and tasty, it's detrimental to long-term well-being. Therefore, it's advisable to prioritize nutrient-rich home-cooked meals in order to maintain optimal fitness and prevent chronic lifestyle illnesses.",
                        formatted: `→ Although fast food is undeniably convenient and tasty, <u>it's detrimental to long-term well-being</u>. Therefore, it's advisable to <span class="sub-hl">prioritize nutrient-rich home-cooked meals</span> in order to <span class="sub-hl">maintain optimal fitness and prevent chronic lifestyle illnesses</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 9,
        title: "Chủ đề 09: Let's talk about cooking",
        introText: "Let’s talk about cooking.",
        questions: [
            {
                qNum: 1,
                question: "Do you like cooking?",
                qType: "Do you like question: Do you like cooking?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Rất thích nấu ăn - Sáng tạo và giải tỏa áp lực sau ngày làm việc):</div>
                    <div class="topic-formula-text">
                        → Yes, definitely. <u>I'm really into cooking</u> because I find it both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. Preparing homemade meals allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Hiếm khi nấu do lịch trình bận rộn - Thường ăn cơm do người thân nấu):</div>
                    <div class="topic-formula-text">
                        → To be honest, <u>I rarely have time to cook</u> because of my demanding schedule. However, I often enjoy wholesome meals prepared by my <span class="formula-bracket-hl">[người thân]</span>, which gives me an opportunity to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt sở thích / thói quen]:",
                        items: [
                            { en: "I'm really into cooking", vn: "Tôi rất mê nấu nướng (+ V-ing / Danh từ)" },
                            { en: "I'm a big fan of", vn: "Tôi là người rất thích / chuộng (+ V-ing / Danh từ)" },
                            { en: "I have a keen interest in", vn: "Tôi có niềm say mê lớn đối với..." },
                            { en: "I rarely have time to cook", vn: "Tôi hiếm khi có thời gian để tự nấu nướng..." }
                        ]
                    },
                    {
                        title: "✨ [Kho tính từ mô tả việc nấu nướng B2]:",
                        items: [
                            { en: "therapeutic and creative", vn: "mang tính trị liệu tâm trí và giàu tính sáng tạo" },
                            { en: "relaxing and rewarding", vn: "thư thái và mang lại cảm giác thành tựu bổ ích" },
                            { en: "enjoyable and practical", vn: "thú vị và rất thiết thực trong cuộc sống" },
                            { en: "an essential life skill", vn: "một kỹ năng sinh tồn thiết yếu" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>unwind after an exhausting day, maintain good health, cherish warm family moments...</em>).`
                    },
                    {
                        title: "🍳 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Nấu ăn]:",
                        items: [
                            { en: "experiment with diverse culinary recipes", vn: "thử nghiệm nhiều công thức nấu nướng phong phú" },
                            { en: "ensure food hygiene and balanced nutrition", vn: "đảm bảo an toàn vệ sinh và dinh dưỡng cân bằng" },
                            { en: "unwind and escape from work-related stress", vn: "thư giãn và tạm gác lại những căng thẳng công việc" },
                            { en: "express love and care for family members", vn: "bày tỏ tình cảm yêu thương và chăm sóc người thân" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Rất thích nấu ăn - Sáng tạo & Thư giãn sau ngày bận rộn)",
                        text: "Yes, definitely. I'm really into cooking because I find it both therapeutic and creative. Preparing homemade meals allows me to experiment with new culinary recipes and gives me a chance to unwind after an exhausting day.",
                        formatted: `→ Yes, definitely. <u>I'm really into cooking</u> because I find it both <span class="sub-hl">therapeutic and creative</span>. Preparing homemade meals allows me to <span class="sub-hl">experiment with new culinary recipes</span> and gives me a chance to <span class="sub-hl">unwind after an exhausting day</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Hiếm khi nấu vì bận học - Ăn cơm mẹ nấu & Duy trì sức khỏe)",
                        text: "To be honest, I rarely have time to cook because of my demanding study schedule. However, I often enjoy wholesome meals prepared by my mother, which allows me to maintain good health and gives me an opportunity to cherish warm family moments.",
                        formatted: `→ To be honest, <u>I rarely have time to cook</u> because of my <span class="sub-hl">demanding study schedule</span>. However, I often enjoy wholesome meals <span class="sub-hl">prepared by my mother</span>, which allows me to <span class="sub-hl">maintain good health</span> and gives me an opportunity to <span class="sub-hl">cherish warm family moments</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "What is the most popular food in your country?",
                qType: "Wh-question: What is the most popular food in your country?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Phở bò truyền thống - Hương vị tinh tế & biểu tượng ẩm thực):</div>
                    <div class="topic-formula-text">
                        → In Vietnam, <u>one of the most iconic and popular dishes is</u> <span class="formula-bracket-hl">[tên món ăn]</span>. It's famous for its <span class="formula-bracket-hl">[đặc trưng món ăn]</span>, which allows diners to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives them a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Bánh mì Việt Nam - Tiện lợi, giòn rụm và đậm đà bản sắc):</div>
                    <div class="topic-formula-text">
                        → Without a doubt, <u>Vietnamese baguette (bánh mì) is exceptionally popular across the country</u>. It's both <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>, making it an ideal choice for <span class="formula-bracket-hl">[đối tượng / hoàn cảnh]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🍲 [Món ăn biểu tượng của Việt Nam]:",
                        items: [
                            { en: "traditional beef noodle soup (Phở bò)", vn: "phở bò truyền thống thơm lừng" },
                            { en: "Vietnamese baguette (Bánh mì)", vn: "bánh mì kẹp thịt Việt Nam" },
                            { en: "crispy traditional spring rolls (Nem rán)", vn: "nem rán giòn rụm" },
                            { en: "broken rice with grilled pork chop (Cơm tấm)", vn: "cơm tấm sườn nướng đậm đà" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ mô tả hương vị & chất lượng]:",
                        items: [
                            { en: "fragrant and deeply flavorful", vn: "thơm nức mũi và đậm đà hương vị" },
                            { en: "crispy on the crust yet savory inside", vn: "vỏ ngoài giòn rụm, nhân bên trong thơm béo" },
                            { en: "wholesome and nutritious", vn: "thanh lành và giàu giá trị dinh dưỡng" },
                            { en: "convenient and budget-friendly", vn: "tiện lợi và giá cả rất hợp túi tiền" }
                        ]
                    },
                    {
                        title: "🌿 [Giá trị ẩm thực]:",
                        items: [
                            { en: "savor the essence of Vietnamese culinary culture", vn: "thưởng thức tinh hoa văn hóa ẩm thực Việt Nam" },
                            { en: "enjoy a nutritious and fulfilling meal on the go", vn: "thưởng thức một bữa ăn no đủ, giàu dinh dưỡng khi bận rộn" },
                            { en: "appreciate the harmonious blend of herbs and spices", vn: "cảm nhận sự hòa quyện tuyệt vời của rau thơm và gia vị" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Phở bò truyền thống - Tinh hoa ẩm thực & Nước dùng thơm nức)",
                        text: "In Vietnam, one of the most iconic and popular dishes is traditional beef noodle soup. It's famous for its fragrant, slow-cooked broth and fresh herbs, which allows diners to savor the essence of Vietnamese culinary culture and enjoy a fulfilling breakfast.",
                        formatted: `→ In Vietnam, <u>one of the most iconic and popular dishes is</u> <span class="sub-hl">traditional beef noodle soup</span>. It's famous for its <span class="sub-hl">fragrant, slow-cooked broth and fresh herbs</span>, which allows diners to <span class="sub-hl">savor the essence of Vietnamese culinary culture</span> and enjoy a fulfilling breakfast.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Bánh mì Việt Nam - Tiện lợi, giòn rụm & Phù hợp mọi người)",
                        text: "Without a doubt, Vietnamese baguette (bánh mì) is exceptionally popular across the country. It's both convenient and budget-friendly, with a crispy crust and savory fillings, making it an ideal choice for students and busy workers on the go.",
                        formatted: `→ Without a doubt, <u>Vietnamese baguette (bánh mì) is exceptionally popular across the country</u>. It's both <span class="sub-hl">convenient and budget-friendly</span>, with a <span class="sub-hl">crispy crust and savory fillings</span>, making it an ideal choice for <span class="sub-hl">students and busy workers on the go</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Do you prefer to eat out or eat at home?",
                qType: "Choice question: Do you prefer to eat out or eat at home?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Ưu tiên ăn ở nhà - Vệ sinh an toàn, cân bằng dinh dưỡng & gắn kết):</div>
                    <div class="topic-formula-text">
                        → Personally, <u>I strongly prefer eating home-cooked meals</u> because they're far more <span class="formula-bracket-hl">[tính từ 1]</span> and <span class="formula-bracket-hl">[tính từ 2]</span>. Dining at home allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Thích ăn ngoài - Tiết kiệm thời gian & đổi gió thưởng thức món mới):</div>
                    <div class="topic-formula-text">
                        → From my perspective, <u>I lean towards eating out occasionally</u> because it saves valuable time on cooking and washing up. Moreover, it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt sự ưu tiên / lựa chọn]:",
                        items: [
                            { en: "I strongly prefer eating home-cooked meals", vn: "Tôi rất chuộng dùng bữa cơm nhà tự nấu" },
                            { en: "I lean towards eating out occasionally", vn: "Tôi có xu hướng thích đi ăn ngoài thỉnh thoảng" },
                            { en: "My personal preference definitely tilts towards", vn: "Lựa chọn của tôi chắc chắn nghiêng về..." }
                        ]
                    },
                    {
                        title: "🥗 [Tính từ & Đặc trưng cơm nhà vs Ăn ngoài]:",
                        items: [
                            { en: "nutritious and hygienic", vn: "giàu dinh dưỡng và đảm bảo vệ sinh an toàn" },
                            { en: "cost-effective and wholesome", vn: "tiết kiệm chi phí và tốt cho sức khỏe" },
                            { en: "time-saving and convenient", vn: "tiết kiệm thời gian và rất thuận tiện" },
                            { en: "diverse and exciting", vn: "phong phú và mang lại nhiều trải nghiệm mới mẻ" }
                        ]
                    },
                    {
                        title: "💡 [Lợi ích mang lại]:",
                        items: [
                            { en: "control calorie and sodium intake easily", vn: "kiểm soát lượng calo và muối nạp vào dễ dàng" },
                            { en: "strengthen family bonding around the dining table", vn: "thắt chặt tình cảm gia đình quanh mâm cơm ấm cúng" },
                            { en: "explore innovative culinary recipes", vn: "khám phá những hương vị ẩm thực sáng tạo mới" },
                            { en: "catch up with friends in a vibrant atmosphere", vn: "trò chuyện cùng bạn bè trong không gian sôi nổi" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Ăn cơm nhà - Kiểm soát dinh dưỡng & Gắn kết gia đình)",
                        text: "Personally, I strongly prefer eating home-cooked meals because they're far more nutritious and hygienic. Dining at home allows me to control ingredients easily and gives me an opportunity to strengthen family bonding around the warm dining table.",
                        formatted: `→ Personally, <u>I strongly prefer eating home-cooked meals</u> because they're far more <span class="sub-hl">nutritious and hygienic</span>. Dining at home allows me to <span class="sub-hl">control ingredients easily</span> and gives me an opportunity to <span class="sub-hl">strengthen family bonding around the warm dining table</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Ăn ngoài - Tiết kiệm thời gian dọn dẹp & Gặp gỡ bạn bè)",
                        text: "From my perspective, I lean towards eating out occasionally because it saves valuable time on cooking and washing up. Moreover, it allows me to explore new culinary tastes and gives me a chance to catch up with friends in a vibrant atmosphere.",
                        formatted: `→ From my perspective, <u>I lean towards eating out occasionally</u> because it <span class="sub-hl">saves valuable time on cooking and washing up</span>. Moreover, it allows me to <span class="sub-hl">explore new culinary tastes</span> and gives me a chance to <span class="sub-hl">catch up with friends in a vibrant atmosphere</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 10,
        title: "Chủ đề 10: Let's talk about the cooking class",
        introText: "Let’s talk about the cooking class.",
        questions: [
            {
                qNum: 1,
                question: "Have you ever been to a cooking class?",
                qType: "Have you ever question: Have you ever been to a cooking class?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Đã từng tham gia - Khóa học làm bánh / nấu ăn bổ ích):</div>
                    <div class="topic-formula-text">
                        → Yes, I have. <u>I had the opportunity to attend</u> <span class="formula-bracket-hl">[loại lớp học]</span> a while ago because I wanted to improve my culinary skills. It was very <span class="formula-bracket-hl">[tính từ]</span>, and it allowed me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gave me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Chưa từng tham gia nhưng rất mong muốn học hỏi):</div>
                    <div class="topic-formula-text">
                        → To be honest, <u>I haven't enrolled in any formal cooking classes yet</u>. However, I have always wanted to join one in the near future because it allows learners to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives them an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt trải nghiệm]:",
                        items: [
                            { en: "I had the opportunity to attend", vn: "Tôi đã có cơ hội tham dự..." },
                            { en: "I haven't enrolled in any formal cooking classes yet", vn: "Tôi chưa từng đăng ký lớp học nấu ăn chính quy nào..." },
                            { en: "I have always wanted to join one in the near future", vn: "Tôi luôn muốn tham gia một khóa trong tương lai gần..." }
                        ]
                    },
                    {
                        title: "🍳 [Loại khóa học nấu ăn]:",
                        items: [
                            { en: "a weekend baking and pastry workshop", vn: "workshop làm bánh ngọt cuối tuần" },
                            { en: "a traditional culinary course", vn: "khóa học nấu ăn các món truyền thống" },
                            { en: "a healthy plant-based cooking class", vn: "lớp học nấu ăn thuần chay lành mạnh" },
                            { en: "a basic culinary fundamentals class", vn: "lớp học kỹ năng nấu nướng cơ bản" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ mô tả khóa học B2]:",
                        items: [
                            { en: "practical and inspiring", vn: "rất thực tế và truyền nhiều cảm hứng" },
                            { en: "informative and well-structured", vn: "giàu thông tin hữu ích và có lộ trình bài bản" },
                            { en: "engaging and rewarding", vn: "lôi cuốn và rất xứng đáng" }
                        ]
                    },
                    {
                        title: "🌿 [Lợi ích khi tham gia lớp học]:",
                        items: [
                            { en: "master professional cooking techniques", vn: "làm chủ các kỹ thuật nấu nướng chuyên nghiệp" },
                            { en: "learn how to balance seasonings and flavors", vn: "học cách nêm nếm và cân bằng hương vị món ăn" },
                            { en: "gain confidence in preparing wholesome meals", vn: "tự tin hơn khi tự tay chuẩn bị các bữa ăn bổ dưỡng" },
                            { en: "connect with other food enthusiasts", vn: "kết nối với những người cùng đam mê ẩm thực" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Đã tham gia workshop làm bánh - Nâng cao tay nghề & Tự nướng bánh cho gia đình)",
                        text: "Yes, I have. I had the opportunity to attend a weekend baking workshop a while ago because I wanted to improve my skills. It was very practical, and it allowed me to master pastry techniques and gave me a chance to bake delicious cakes for my family.",
                        formatted: `→ Yes, I have. <u>I had the opportunity to attend</u> <span class="sub-hl">a weekend baking workshop</span> a while ago because I wanted to improve my skills. It was <span class="sub-hl">very practical</span>, and it allowed me to <span class="sub-hl">master pastry techniques</span> and gave me a chance to <span class="sub-hl">bake delicious cakes for my family</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Chưa từng tham gia - Mong muốn học hỏi kỹ thuật bài bản từ đầu bếp)",
                        text: "To be honest, I haven't enrolled in any formal cooking classes yet, as I mostly learn from online video tutorials. However, I really want to join one soon because it allows learners to practice with professional chefs and gives them an opportunity to refine their cooking skills.",
                        formatted: `→ To be honest, <u>I haven't enrolled in any formal cooking classes yet</u>, as I mostly learn from online video tutorials. However, I really want to join one soon because it allows learners to <span class="sub-hl">practice with professional chefs</span> and gives them an opportunity to <span class="sub-hl">refine their cooking skills</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "Would you prefer to go there alone or with someone else?",
                qType: "Choice question: Would you prefer to go there alone or with someone else?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Đi cùng bạn bè / người thân - Hỗ trợ và chia sẻ niềm vui thực hành):</div>
                    <div class="topic-formula-text">
                        → <u>I would definitely prefer going with</u> my <span class="formula-bracket-hl">[đối tượng đi cùng]</span> because we can <span class="formula-bracket-hl">[hành động hỗ trợ]</span>. Practicing together makes the session much more <span class="formula-bracket-hl">[tính từ]</span> and gives us a chance to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Đi một mình - Tập trung cao độ và tiếp thu theo nhịp độ riêng):</div>
                    <div class="topic-formula-text">
                        → In my view, <u>I would rather attend the class on my own</u> because it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> without any distractions. It also gives me an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt sở thích đồng hành]:",
                        items: [
                            { en: "I would definitely prefer going with", vn: "Tôi chắc chắn thích đi cùng với..." },
                            { en: "I would rather attend the class on my own", vn: "Tôi muốn tham gia lớp học một mình hơn" },
                            { en: "My personal preference is to take part alongside", vn: "Lựa chọn của tôi là tham gia cùng với..." }
                        ]
                    },
                    {
                        title: "👥 [Người đồng hành]:",
                        items: [
                            { en: "my close friend", vn: "người bạn thân thiết của tôi" },
                            { en: "my sister / family member", vn: "chị gái / thành viên gia đình tôi" },
                            { en: "a fellow cooking lover", vn: "một người bạn có chung sở thích nấu nướng" }
                        ]
                    },
                    {
                        title: "✨ [Tính từ mô tả trải nghiệm]:",
                        items: [
                            { en: "motivating and collaborative", vn: "tạo nhiều động lực và mang tính tương trợ lẫn nhau" },
                            { en: "enjoyable and memorable", vn: "thú vị và đáng nhớ" },
                            { en: "focused and productive", vn: "tập trung cao độ và hiệu quả" }
                        ]
                    },
                    {
                        title: "💡 [Lợi ích tương ứng]:",
                        items: [
                            { en: "support each other during hands-on practice", vn: "hỗ trợ lẫn nhau trong suốt buổi thực hành" },
                            { en: "share feedback and sample each other's dishes", vn: "góp ý và cùng nếm thử món ăn của nhau" },
                            { en: "concentrate fully on the instructor's guidance", vn: "tập trung tuyệt đối vào sự hướng dẫn của giảng viên" },
                            { en: "absorb culinary techniques at my own pace", vn: "tiếp thu kỹ thuật nấu nướng theo nhịp độ của riêng mình" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Đi cùng bạn thân - Hỗ trợ thực hành & Chia sẻ niềm vui)",
                        text: "I would definitely prefer going with my close friend because we can support each other during hands-on practice. Cooking together makes the experience much more motivating and gives us a chance to share enjoyable memories and delicious dishes.",
                        formatted: `→ <u>I would definitely prefer going with</u> <span class="sub-hl">my close friend</span> because we can <span class="sub-hl">support each other during hands-on practice</span>. Cooking together makes the experience much more <span class="sub-hl">motivating</span> and gives us a chance to <span class="sub-hl">share enjoyable memories and delicious dishes</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Đi một mình - Tập trung trọn vẹn & Học theo nhịp độ riêng)",
                        text: "In my view, I would rather attend the class on my own because it allows me to concentrate fully on the instructor's guidance without distractions. It also gives me an opportunity to work independently and absorb culinary techniques at my own pace.",
                        formatted: `→ In my view, <u>I would rather attend the class on my own</u> because it allows me to <span class="sub-hl">concentrate fully on the instructor's guidance</span> without distractions. It also gives me an opportunity to <span class="sub-hl">work independently and absorb culinary techniques at my own pace</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "How important is a cooking class?",
                qType: "Wh-question: How important is a cooking class?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Rất quan trọng - Cung cấp kỹ năng sống thiết yếu & lối sống lành mạnh):</div>
                    <div class="topic-formula-text">
                        → From my perspective, <u>a cooking class is of great importance</u> because it equips people with <span class="formula-bracket-hl">[kỹ năng / kiến thức]</span>. It allows learners to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives them an opportunity to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Hữu ích nhưng không bắt buộc - Có thể tự học qua Internet tiết kiệm):</div>
                    <div class="topic-formula-text">
                        → While a cooking class is undoubtedly beneficial, <u>I don't consider it absolutely indispensable</u>. Thanks to the internet, people can easily learn from <span class="formula-bracket-hl">[kênh tự học]</span>, which allows them to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> while <span class="formula-bracket-hl">[lợi ích 2 - V-ing]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc đánh giá mức độ quan trọng]:",
                        items: [
                            { en: "is of great importance", vn: "có tầm quan trọng to lớn" },
                            { en: "is undoubtedly beneficial", vn: "không nghi ngờ gì là rất có ích" },
                            { en: "I don't consider it absolutely indispensable", vn: "Tôi không xem nó là điều hoàn toàn bắt buộc" }
                        ]
                    },
                    {
                        title: "✨ [Kỹ năng & Lợi ích lớp học nấu ăn]:",
                        items: [
                            { en: "essential culinary life skills", vn: "các kỹ năng sống nấu nướng thiết yếu" },
                            { en: "proper food safety and hygiene principles", vn: "các nguyên tắc an toàn và vệ sinh thực phẩm chuẩn chỉnh" },
                            { en: "understand balanced nutritional values", vn: "hiểu rõ các giá trị dinh dưỡng cân bằng" },
                            { en: "maintain an independent and healthy lifestyle", vn: "duy trì lối sống tự lập và lành mạnh" }
                        ]
                    },
                    {
                        title: "📱 [Kênh tự học thay thế]:",
                        items: [
                            { en: "free online culinary tutorials", vn: "các bài giảng nấu ăn trực tuyến miễn phí" },
                            { en: "cooking blogs and video platforms", vn: "các blog ẩm thực và nền tảng video" },
                            { en: "acquire practical cooking skills flexibly", vn: "tiếp thu kỹ năng nấu ăn một cách linh hoạt" },
                            { en: "saving substantial tuition expenses", vn: "tiết kiệm được đáng kể chi phí học phí" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Rất quan trọng - Kỹ năng sống thiết yếu & Vệ sinh an toàn thực phẩm)",
                        text: "From my perspective, a cooking class is of great importance because it equips people with essential culinary life skills. It allows learners to understand food hygiene principles and gives them an opportunity to maintain a nutritious and independent lifestyle.",
                        formatted: `→ From my perspective, <u>a cooking class is of great importance</u> because it equips people with <span class="sub-hl">essential culinary life skills</span>. It allows learners to <span class="sub-hl">understand food hygiene principles</span> and gives them an opportunity to <span class="sub-hl">maintain a nutritious and independent lifestyle</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Hữu ích nhưng không bắt buộc - Tự học video mạng linh hoạt & tiết kiệm)",
                        text: "While a cooking class is undoubtedly beneficial, I don't consider it absolutely indispensable. Thanks to the internet, people can easily follow free video tutorials, which allows them to acquire practical cooking skills flexibly while saving substantial tuition expenses.",
                        formatted: `→ While a cooking class is undoubtedly beneficial, <u>I don't consider it absolutely indispensable</u>. Thanks to the internet, people can easily follow <span class="sub-hl">free video tutorials</span>, which allows them to <span class="sub-hl">acquire practical cooking skills flexibly</span> while <span class="sub-hl">saving substantial tuition expenses</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 11,
        title: "Chủ đề 11: Let's talk about health",
        introText: "Let’s talk about health.",
        questions: [
            {
                qNum: 1,
                question: "Do you think you are a healthy person? Why?",
                qType: "Yes/No + Wh-question: Do you think you are a healthy person? Why?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời CÓ - Duy trì lối sống lành mạnh, ăn uống điều độ và tập thể dục hàng ngày):</div>
                    <div class="topic-formula-text">
                        → Yes, definitely. <u>I consider myself a healthy person</u> because I always maintain a <span class="formula-bracket-hl">[lối sống lành mạnh]</span>. Sticking to <span class="formula-bracket-hl">[thói quen tốt]</span> allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and helps me <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời CHƯA HẲN - Do công việc/học tập bận rộn nên thức khuya, đang nỗ lực cải thiện):</div>
                    <div class="topic-formula-text">
                        → To be honest, <u>I wouldn't say I'm completely healthy</u> because I have a <span class="formula-bracket-hl">[lịch trình bận rộn]</span>, which leads to <span class="formula-bracket-hl">[thói quen chưa tốt]</span>. However, <u>I'm making an effort to</u> <span class="formula-bracket-hl">[hành động cải thiện - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc trả lời đánh giá bản thân]:",
                        items: [
                            { en: "I consider myself a healthy person", vn: "Tôi tự thấy mình là một người khỏe mạnh" },
                            { en: "I wouldn't say I'm completely healthy", vn: "Tôi không dám nói là mình hoàn toàn khỏe mạnh" },
                            { en: "maintain a healthy and active lifestyle", vn: "duy trì lối sống lành mạnh và năng động" },
                            { en: "make an effort to improve my daily habits", vn: "nỗ lực cải thiện các thói quen hàng ngày" }
                        ]
                    },
                    {
                        title: "✨ [Lối sống & Thói quen sức khỏe]:",
                        items: [
                            { en: "a balanced and nutritious diet", vn: "chế độ ăn uống cân bằng và giàu dinh dưỡng" },
                            { en: "regular physical workouts", vn: "các buổi rèn luyện thể chất đều đặn" },
                            { en: "a demanding work schedule", vn: "lịch trình công việc dày đặc, nhiều áp lực" },
                            { en: "staying up late quite often", vn: "thức khuya khá thường xuyên" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>boost my stamina, stay energetic throughout the day, sleep much better at night...</em>).`
                    },
                    {
                        title: "🏃 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Sức khỏe]:",
                        items: [
                            { en: "strengthen my immune system", vn: "tăng cường hệ thống miễn dịch của cơ thể" },
                            { en: "recharge my battery after a long day", vn: "nạp lại năng lượng sau một ngày dài" },
                            { en: "sleep much better at night", vn: "ngủ ngon và sâu giấc hơn vào ban đêm" },
                            { en: "avoid feeling tired and lethargic", vn: "tránh cảm giác uể oải và mệt mỏi trong ngày" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời CÓ - Lối sống lành mạnh, ăn uống điều độ & tập thể dục)",
                        text: "Yes, definitely. I consider myself a healthy person because I always maintain a healthy and active lifestyle. Sticking to a balanced diet and exercising regularly allows me to boost my stamina and helps me stay energetic throughout the day.",
                        formatted: `→ Yes, definitely. <u>I consider myself a healthy person</u> because I always maintain a <span class="sub-hl">healthy and active lifestyle</span>. Sticking to a <span class="sub-hl">balanced diet and exercising regularly</span> allows me to <span class="sub-hl">boost my stamina</span> and helps me <span class="sub-hl">stay energetic throughout the day</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời CHƯA HẲN - Lịch làm việc dày đặc, thức khuya & đang nỗ lực cải thiện)",
                        text: "To be honest, I wouldn't say I'm completely healthy because I have a demanding work schedule, which leads to staying up late quite often. However, I'm making an effort to sleep earlier and eat more green vegetables.",
                        formatted: `→ To be honest, <u>I wouldn't say I'm completely healthy</u> because I have a <span class="sub-hl">demanding work schedule</span>, which leads to <span class="sub-hl">staying up late quite often</span>. However, <u>I'm making an effort to</u> <span class="sub-hl">sleep earlier and eat more green vegetables</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "What do you do to maintain good health and a fit body?",
                qType: "Wh-question: What do you do to maintain [noun]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Tập gym/chạy bộ đều đặn & Hạn chế đồ ngọt để giữ dáng thon gọn):</div>
                    <div class="topic-formula-text">
                        → In order to stay healthy and fit, <u>I make it a rule to</u> <span class="formula-bracket-hl">[hoạt động thể thao]</span> on a regular basis. In addition, I try to <span class="formula-bracket-hl">[thói quen ăn uống]</span> because it allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Uống nhiều nước & Ngủ đủ 8 tiếng để tái tạo năng lượng và thanh thản đầu óc):</div>
                    <div class="topic-formula-text">
                        → Personally, <u>I focus on building healthy daily habits</u>, especially <span class="formula-bracket-hl">[thói quen 1 - V-ing]</span> and <span class="formula-bracket-hl">[thói quen 2 - V-ing]</span>. These positive routines help me <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> while <span class="formula-bracket-hl">[lợi ích 2 - V-ing]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc nêu thói quen rèn luyện]:",
                        items: [
                            { en: "I make it a rule to", vn: "Tôi luôn đặt thành nguyên tắc phải..." },
                            { en: "I focus on building healthy daily habits", vn: "Tôi tập trung xây dựng các thói quen lành mạnh mỗi ngày" },
                            { en: "on a regular basis", vn: "một cách đều đặn, thường xuyên" },
                            { en: "as an effective way to stay in shape", vn: "như một phương pháp hữu hiệu để giữ dáng" }
                        ]
                    },
                    {
                        title: "✨ [Thói quen tập luyện & Dinh dưỡng]:",
                        items: [
                            { en: "work out at the gym", vn: "tập luyện thể hình tại phòng gym" },
                            { en: "go jogging in the local park", vn: "chạy bộ trong công viên gần nhà" },
                            { en: "cut down on sugary drinks and fast food", vn: "cắt giảm đồ uống nhiều đường và đồ ăn nhanh" },
                            { en: "drink plenty of water throughout the day", vn: "uống nhiều nước đều đặn trong ngày" },
                            { en: "get eight hours of sound sleep every night", vn: "ngủ đủ 8 tiếng ngủ sâu giấc mỗi đêm" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>burn excess calories, stay in good shape, recharge my energy, relieve stress...</em>).`
                    },
                    {
                        title: "🍎 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Giữ dáng & Sức khỏe]:",
                        items: [
                            { en: "maintain an ideal body weight", vn: "duy trì mức cân nặng lý tưởng và săn chắc" },
                            { en: "enhance my physical stamina", vn: "nâng cao sức bền thể lực của bản thân" },
                            { en: "cleanse the body and refresh the skin", vn: "thanh lọc cơ thể và nuôi dưỡng làn da tươi tắn" },
                            { en: "keep my mind calm and clear", vn: "giữ cho đầu óc luôn thanh thản và sáng suốt" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Tập gym đều đặn, cắt giảm đồ ngọt để đốt calo & giữ vóc dáng)",
                        text: "In order to stay healthy and fit, I make it a rule to work out at the gym on a regular basis. In addition, I try to cut down on sugary drinks and eat clean food because it allows me to burn excess calories and gives me a chance to stay in good shape.",
                        formatted: `→ In order to stay healthy and fit, <u>I make it a rule to</u> <span class="sub-hl">work out at the gym</span> on a regular basis. In addition, I try to <span class="sub-hl">cut down on sugary drinks and eat clean food</span> because it allows me to <span class="sub-hl">burn excess calories</span> and gives me a chance to <span class="sub-hl">stay in good shape</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Uống nhiều nước, ngủ sâu 8 tiếng mỗi đêm để nạp năng lượng & thư thái đầu óc)",
                        text: "Personally, I focus on building healthy daily habits, especially drinking plenty of water and getting eight hours of sound sleep every night. These positive routines help me recharge my energy while keeping my mind calm and clear.",
                        formatted: `→ Personally, <u>I focus on building healthy daily habits</u>, especially <span class="sub-hl">drinking plenty of water</span> and <span class="sub-hl">getting eight hours of sound sleep every night</span>. These positive routines help me <span class="sub-hl">recharge my energy</span> while <span class="sub-hl">keeping my mind calm and clear</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "What do you think are the benefits of good health?",
                qType: "Wh-question: What do you think are the benefits of [noun]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Làm việc năng suất cao & Dành trọn thời gian quý giá bên người thân):</div>
                    <div class="topic-formula-text">
                        → From my perspective, <u>having good health brings countless benefits</u>. First of all, it allows people to <span class="formula-bracket-hl">[lợi ích công việc - Vo]</span> without feeling exhausted. Furthermore, it gives us the energy to <span class="formula-bracket-hl">[lợi ích cuộc sống - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Phòng ngừa bệnh tật nghiêm trọng, tiết kiệm viện phí & Tinh thần luôn vui tươi, lạc quan):</div>
                    <div class="topic-formula-text">
                        → Without a doubt, <u>good health is our greatest asset</u> because it helps us <span class="formula-bracket-hl">[lợi ích phòng bệnh - Vo]</span> and <span class="formula-bracket-hl">[lợi ích tài chính - Vo]</span>. It also enables us to maintain a <span class="formula-bracket-hl">[tính từ tinh thần]</span> mindset every single day.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc mở đầu nhận định về sức khỏe]:",
                        items: [
                            { en: "having good health brings countless benefits", vn: "có sức khỏe tốt mang lại vô số lợi ích" },
                            { en: "good health is our greatest asset", vn: "sức khỏe tốt là tài sản quý giá nhất của chúng ta" },
                            { en: "without feeling easily exhausted", vn: "mà không bị kiệt sức nhanh chóng" },
                            { en: "every single day", vn: "mỗi một ngày trong cuộc đời" }
                        ]
                    },
                    {
                        title: "✨ [Lợi ích công việc & Tinh thần]:",
                        items: [
                            { en: "work and study with high productivity", vn: "làm việc và học tập với năng suất cao" },
                            { en: "avoid serious illnesses", vn: "phòng tránh những căn bệnh nghiêm trọng" },
                            { en: "save medical expenses", vn: "tiết kiệm chi phí khám chữa bệnh" },
                            { en: "positive and cheerful mindset", vn: "tâm lý tích cực và vui vẻ" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>spend quality time with loved ones, enjoy life to the fullest, maintain high productivity...</em>).`
                    },
                    {
                        title: "💼 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Giá trị của sức khỏe]:",
                        items: [
                            { en: "pursue long-term career aspirations", vn: "theo đuổi những ước mơ và mục tiêu sự nghiệp dài hạn" },
                            { en: "reduce anxiety and mental fatigue", vn: "giảm bớt lo âu và sự mỏi mệt về mặt tinh thần" },
                            { en: "live a long, fulfilling, and independent life", vn: "sống một cuộc đời dài lâu, trọn vẹn và tự lập" },
                            { en: "cope effectively with daily pressures", vn: "đương đầu hiệu quả với những áp lực cuộc sống thường ngày" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Làm việc năng suất cao & Dành thời gian trọn vẹn bên người thân)",
                        text: "From my perspective, having good health brings countless benefits. First of all, it allows people to work and study with high productivity without feeling easily exhausted. Furthermore, it gives us the energy to spend quality time with loved ones and enjoy life to the fullest.",
                        formatted: `→ From my perspective, <u>having good health brings countless benefits</u>. First of all, it allows people to <span class="sub-hl">work and study with high productivity</span> without feeling easily exhausted. Furthermore, it gives us the energy to <span class="sub-hl">spend quality time with loved ones</span> and <span class="sub-hl">enjoy life to the fullest</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Tránh bệnh nghiêm trọng, tiết kiệm viện phí & Tinh thần luôn vui vẻ tích cực)",
                        text: "Without a doubt, good health is our greatest asset because it helps us avoid serious illnesses and save medical expenses. It also enables us to maintain a positive and cheerful mindset every single day.",
                        formatted: `→ Without a doubt, <u>good health is our greatest asset</u> because it helps us <span class="sub-hl">avoid serious illnesses</span> and <span class="sub-hl">save medical expenses</span>. It also enables us to maintain a <span class="sub-hl">positive and cheerful mindset</span> every single day.`
                    }
                ]
            }
        ]
    },
    {
        id: 12,
        title: "Chủ đề 12: Let's talk about health (part 2)",
        introText: "Let’s talk about health.",
        questions: [
            {
                qNum: 1,
                question: "Do you often get sick?",
                qType: "Yes/No: Do you often [Vo]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời HIẾM KHI - Hệ miễn dịch tốt nhờ chăm tập thể thao và ăn uống lành mạnh):</div>
                    <div class="topic-formula-text">
                        → Fortunately, <u>I rarely get sick</u> because I have a <span class="formula-bracket-hl">[thể trạng / hệ miễn dịch]</span>. Sticking to <span class="formula-bracket-hl">[thói quen tốt]</span> allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and prevents me from <span class="formula-bracket-hl">[nguy cơ mắc bệnh - V-ing]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời THỈNH THOẢNG - Cảm nhẹ khi thời tiết đổi mùa, nhanh khỏi nhờ nghỉ ngơi & uống nước ấm):</div>
                    <div class="topic-formula-text">
                        → To be honest, <u>I only come down with minor illnesses once in a while</u>, especially <span class="formula-bracket-hl">[thời điểm / lý do]</span>. However, I usually recover within a couple of days by <span class="formula-bracket-hl">[hành động tự chăm sóc - V-ing]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc tần suất mắc bệnh]:",
                        items: [
                            { en: "Fortunately, I rarely get sick", vn: "May mắn thay, tôi rất hiếm khi bị ốm đau" },
                            { en: "I only come down with minor illnesses once in a while", vn: "Tôi chỉ thỉnh thoảng mắc vài bệnh nhẹ" },
                            { en: "I usually recover within a couple of days", vn: "Tôi thường bình phục chỉ trong vòng vài ngày" },
                            { en: "prevents me from catching seasonal colds", vn: "ngăn tôi khỏi bị nhiễm cảm lạnh theo mùa" }
                        ]
                    },
                    {
                        title: "✨ [Thể trạng & Biểu hiện ốm nhẹ]:",
                        items: [
                            { en: "strong immune system", vn: "hệ miễn dịch khỏe mạnh" },
                            { en: "regular exercise and healthy eating", vn: "tập thể dục đều đặn và ăn uống lành mạnh" },
                            { en: "when the weather changes drastically", vn: "khi thời tiết thay đổi đột ngột / giao mùa" },
                            { en: "resting properly and drinking warm lemon water", vn: "nghỉ ngơi hợp lý và uống nước chanh ấm" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>maintain good health, stay resilient, bounce back quickly...</em>).`
                    },
                    {
                        title: "🛡️ [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Đề kháng & Bình phục]:",
                        items: [
                            { en: "fight off common seasonal viruses", vn: "chống lại các virus cảm cúm theo mùa thông thường" },
                            { en: "avoid taking unnecessary antibiotics", vn: "tránh việc phải dùng thuốc kháng sinh không cần thiết" },
                            { en: "regain physical strength in no time", vn: "phục hồi thể lực lại rất nhanh chóng" },
                            { en: "keep my daily routine uninterrupted", vn: "giữ cho lịch trình sinh hoạt và làm việc không bị gián đoạn" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời HIẾM KHI - Hệ miễn dịch khỏe, tập thể dục & ăn uống điều độ)",
                        text: "Fortunately, I rarely get sick because I have a strong immune system. Sticking to regular exercise and healthy eating allows me to stay resilient and prevents me from catching seasonal colds.",
                        formatted: `→ Fortunately, <u>I rarely get sick</u> because I have a <span class="sub-hl">strong immune system</span>. Sticking to <span class="sub-hl">regular exercise and healthy eating</span> allows me to <span class="sub-hl">stay resilient</span> and prevents me from <span class="sub-hl">catching seasonal colds</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời THỈNH THOẢNG - Cảm nhẹ khi đổi mùa, nhanh khỏi nhờ nghỉ ngơi & uống nước chanh ấm)",
                        text: "To be honest, I only come down with minor illnesses once in a while, especially when the weather changes drastically. However, I usually recover within a couple of days by resting properly, drinking warm lemon water, and taking light medicine.",
                        formatted: `→ To be honest, <u>I only come down with minor illnesses once in a while</u>, especially <span class="sub-hl">when the weather changes drastically</span>. However, I usually recover within a couple of days by <span class="sub-hl">resting properly, drinking warm lemon water, and taking light medicine</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "Do you often go to the doctor?",
                qType: "Yes/No: Do you often [Vo]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Chỉ đi khi thật sự cần thiết / ốm nặng - Bình thường tự nghỉ ngơi uống nước ấm tại nhà):</div>
                    <div class="topic-formula-text">
                        → Generally speaking, <u>I only visit the doctor when it's really necessary</u>, such as when I feel <span class="formula-bracket-hl">[tình trạng ốm nặng]</span>. For minor health issues, I prefer to <span class="formula-bracket-hl">[hành động tự chăm sóc - Vo]</span> because it allows my body to <span class="formula-bracket-hl">[lợi ích - Vo]</span> naturally.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Đi khám định kỳ 6 tháng/lần - Tầm soát bệnh sớm và nhận lời khuyên y tế):</div>
                    <div class="topic-formula-text">
                        → Yes, <u>I make a point of seeing the doctor</u> <span class="formula-bracket-hl">[tần suất]</span> for a comprehensive health check-up. This proactive habit helps me <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me useful medical guidance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc thói quen thăm khám y tế]:",
                        items: [
                            { en: "I only visit the doctor when it's really necessary", vn: "Tôi chỉ đi khám bác sĩ khi thực sự cần thiết" },
                            { en: "I make a point of seeing the doctor", vn: "Tôi luôn chủ động đi khám bác sĩ định kỳ..." },
                            { en: "for a comprehensive health check-up", vn: "để kiểm tra sức khỏe tổng quát toàn diện" },
                            { en: "gives me peace of mind", vn: "mang lại sự an tâm tuyệt đối cho bản thân" }
                        ]
                    },
                    {
                        title: "✨ [Tình trạng sức khỏe & Khám định kỳ]:",
                        items: [
                            { en: "seriously unwell or have a high fever", vn: "ốm nặng hoặc bị sốt cao" },
                            { en: "rest at home and drink plenty of warm water", vn: "nghỉ ngơi tại nhà và uống nhiều nước ấm" },
                            { en: "every six months / once a year", vn: "mỗi 6 tháng một lần / mỗi năm một lần" },
                            { en: "detect potential illnesses early", vn: "phát hiện sớm các mầm bệnh hoặc vấn đề tiềm ẩn" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>protect my long-term well-being, heal naturally, feel completely reassured...</em>).`
                    },
                    {
                        title: "🩺 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Chăm sóc y tế]:",
                        items: [
                            { en: "monitor key health indicators", vn: "theo dõi các chỉ số sức khỏe trọng yếu của cơ thể" },
                            { en: "prevent minor symptoms from becoming severe", vn: "ngăn chặn các triệu chứng nhẹ diễn biến nghiêm trọng" },
                            { en: "receive professional lifestyle advice", vn: "nhận được những lời khuyên điều chỉnh lối sống từ bác sĩ" },
                            { en: "avoid the health risks of self-medication", vn: "tránh các rủi ro nguy hiểm khi tự ý dùng thuốc sai cách" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Chỉ đi khi ốm nặng - Bình thường nghỉ ngơi uống nước ấm để cơ thể tự hồi phục)",
                        text: "Generally speaking, I only visit the doctor when it's really necessary, such as when I feel seriously unwell or have a high fever. For minor health issues, I prefer to rest at home and drink plenty of warm water, which allows my body to heal naturally.",
                        formatted: `→ Generally speaking, <u>I only visit the doctor when it's really necessary</u>, such as when I feel <span class="sub-hl">seriously unwell or have a high fever</span>. For minor health issues, I prefer to <span class="sub-hl">rest at home and drink plenty of warm water</span>, which allows my body to <span class="sub-hl">heal naturally</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Khám tổng quát 6 tháng/lần - Phát hiện bệnh sớm & Bảo vệ sức khỏe dài hạn)",
                        text: "Yes, I make a point of seeing the doctor every six months for a comprehensive health check-up. This proactive habit helps me detect potential illnesses early and gives me useful medical guidance to protect my long-term well-being.",
                        formatted: `→ Yes, <u>I make a point of seeing the doctor</u> <span class="sub-hl">every six months for a comprehensive health check-up</span>. This proactive habit helps me <span class="sub-hl">detect potential illnesses early</span> and gives me useful medical guidance to <span class="sub-hl">protect my long-term well-being</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Do you think people care more about their health nowadays? Why?",
                qType: "Yes/No + Wh-question: Do you think people [verb] nowadays? Why?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời CÓ - Do ô nhiễm môi trường & dịch bệnh nên tích cực ăn sạch, tập luyện):</div>
                    <div class="topic-formula-text">
                        → Yes, definitely. <u>People are noticeably more health-conscious today</u> because of growing concerns about <span class="formula-bracket-hl">[mối lo ngại]</span>. As a result, they actively <span class="formula-bracket-hl">[hành động bảo vệ sức khỏe]</span> in order to <span class="formula-bracket-hl">[lợi ích - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời CÓ - Áp lực xã hội hiện đại khiến mọi người đầu tư cho gym & dinh dưỡng):</div>
                    <div class="topic-formula-text">
                        → Yes, absolutely. <u>In this fast-paced modern society</u>, people increasingly realize that <span class="formula-bracket-hl">[quan niệm sức khỏe]</span>. Therefore, many people invest in <span class="formula-bracket-hl">[khoản đầu tư sức khỏe]</span>, which enables them to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc phân tích xu hướng xã hội]:",
                        items: [
                            { en: "People are noticeably more health-conscious today", vn: "Mọi người ngày nay có ý thức về sức khỏe rõ rệt hơn" },
                            { en: "In this fast-paced modern society", vn: "Trong xã hội hiện đại với nhịp sống hối hả này" },
                            { en: "health is our most valuable asset", vn: "sức khỏe là tài sản giá trị nhất của chúng ta" },
                            { en: "invest time and money in wellness", vn: "đầu tư thời gian và tiền bạc vào chăm sóc sức khỏe" }
                        ]
                    },
                    {
                        title: "✨ [Xu hướng chăm sóc sức khỏe hiện đại]:",
                        items: [
                            { en: "environmental pollution and new diseases", vn: "ô nhiễm môi trường và các dịch bệnh mới" },
                            { en: "choose organic food and exercise regularly", vn: "chọn thực phẩm hữu cơ và tập thể thao đều đặn" },
                            { en: "gym memberships and nutritious meals", vn: "thẻ thành viên phòng gym và các bữa ăn giàu dưỡng chất" },
                            { en: "cope with work stress and avoid burnout", vn: "đối phó với căng thẳng công việc và tránh kiệt sức" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>strengthen their immune system, cope with work stress, enjoy a happier lifestyle...</em>).`
                    },
                    {
                        title: "🧘 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Ý thức sức khỏe cộng đồng]:",
                        items: [
                            { en: "adopt a proactive preventive mindset", vn: "hình thành tư duy phòng ngừa bệnh tật chủ động" },
                            { en: "balance demanding careers with physical wellness", vn: "cân bằng sự nghiệp bận rộn với sức khỏe thể chất" },
                            { en: "enhance overall quality of life and longevity", vn: "nâng cao chất lượng cuộc sống nói chung và kéo dài tuổi thọ" },
                            { en: "inspire family members to adopt clean habits", vn: "truyền cảm hứng cho các thành viên trong gia đình sống sạch" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời CÓ - Quan ngại ô nhiễm & dịch bệnh nên chuộng ăn sạch, tập thể dục)",
                        text: "Yes, definitely. People are noticeably more health-conscious today because of growing concerns about environmental pollution and new diseases. As a result, they actively choose organic food and exercise regularly in order to strengthen their immune system.",
                        formatted: `→ Yes, definitely. <u>People are noticeably more health-conscious today</u> because of growing concerns about <span class="sub-hl">environmental pollution and new diseases</span>. As a result, they actively <span class="sub-hl">choose organic food and exercise regularly</span> in order to <span class="sub-hl">strengthen their immune system</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời CÓ - Sức khỏe là tài sản quý giá nhất, đầu tư phòng gym & ăn uống lành mạnh)",
                        text: "Yes, absolutely. In this fast-paced modern society, people increasingly realize that health is our most valuable asset. Therefore, many people invest in gym memberships and nutritious meals, which enables them to cope with work stress and enjoy a happier lifestyle.",
                        formatted: `→ Yes, absolutely. <u>In this fast-paced modern society</u>, people increasingly realize that <span class="sub-hl">health is our most valuable asset</span>. Therefore, many people invest in <span class="sub-hl">gym memberships and nutritious meals</span>, which enables them to <span class="sub-hl">cope with work stress</span> and <span class="sub-hl">enjoy a happier lifestyle</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 13,
        title: "Chủ đề 13: Talk about your favorite day of the week",
        introText: "Let’s talk about your favorite day of the week.",
        questions: [
            {
                qNum: 1,
                question: "What’s your favorite day of the week?",
                qType: "Wh-question: What is your favorite [noun]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Thứ Bảy / Cuối tuần - Ngủ nướng tự do, nghỉ ngơi sau tuần bận rộn):</div>
                    <div class="topic-formula-text">
                        → Without doubt, <u>my absolute favorite day of the week is Saturday</u> because I can <span class="formula-bracket-hl">[hoạt động tự do - Vo]</span>. It gives me plenty of time to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and allows me to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Thứ Sáu - Cuối tuần cận kề, tâm trạng phấn khởi hoàn thành nốt công việc):</div>
                    <div class="topic-formula-text">
                        → Personally, <u>I look forward to Friday the most</u> because the weekend is just around the corner. It's a wonderful day that allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> while <span class="formula-bracket-hl">[lợi ích 2 - V-ing]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc bày tỏ ngày yêu thích & Cảm xúc]:",
                        items: [
                            { en: "my absolute favorite day of the week is Saturday", vn: "ngày tôi yêu thích nhất trong tuần chắc chắn là thứ Bảy" },
                            { en: "I look forward to Friday the most", vn: "tôi mong chờ ngày thứ Sáu nhất" },
                            { en: "the weekend is just around the corner", vn: "kỳ nghỉ cuối tuần đã cận kề ngay trước mắt" },
                            { en: "it gives me plenty of time to [Vo]", vn: "nó mang lại cho tôi nhiều thời gian để..." }
                        ]
                    },
                    {
                        title: "🗓️ [Hoạt động tự do & Tâm trạng vui tươi]:",
                        items: [
                            { en: "sleep in without any alarm", vn: "ngủ nướng thoải mái không cần báo thức" },
                            { en: "wake up at my own pace", vn: "thức dậy ung dung theo nhịp điệu của riêng mình" },
                            { en: "finish weekly deadlines", vn: "hoàn tất các hạn chót trong tuần" },
                            { en: "staying in a cheerful and excited mood", vn: "duy trì tâm trạng vui tươi và hào hứng" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>unwind after an exhausting week, recharge my batteries, clear my mind...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Tự do & Tái tạo]:",
                        items: [
                            { en: "take full control of my schedule", vn: "chủ động làm chủ toàn bộ thời gian biểu của bản thân" },
                            { en: "catch up on my favorite hobbies", vn: "dành trọn thời gian cho các sở thích yêu thích" },
                            { en: "step away from hectic routines", vn: "tạm gác lại những guồng quay bận rộn thường ngày" },
                            { en: "enjoy peaceful personal moments", vn: "tận hưởng những giây phút cá nhân thật bình yên" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Thứ Bảy - Ngủ nướng tự do, xả stress và nạp lại năng lượng sau tuần dài)",
                        text: "Without doubt, my absolute favorite day of the week is Saturday because I can sleep in without any alarm. It gives me plenty of time to unwind after an exhausting week and allows me to recharge my batteries.",
                        formatted: `→ Without doubt, <u>my absolute favorite day of the week is Saturday</u> because I can <span class="sub-hl">sleep in without any alarm</span>. It gives me plenty of time to <span class="sub-hl">unwind after an exhausting week</span> and allows me to <span class="sub-hl">recharge my batteries</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Thứ Sáu - Cuối tuần cận kề, hoàn thành công việc với tâm trạng hân hoan)",
                        text: "Personally, I look forward to Friday the most because the weekend is just around the corner. It's a wonderful day that allows me to finish weekly deadlines while staying in a cheerful and excited mood.",
                        formatted: `→ Personally, <u>I look forward to Friday the most</u> because <span class="sub-hl">the weekend is just around the corner</span>. It's a wonderful day that allows me to <span class="sub-hl">finish weekly deadlines</span> while <span class="sub-hl">staying in a cheerful and excited mood</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "What do you often do on that day? Why?",
                qType: "Wh-question: What do you often do on [time]? Why?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Ra ngoài cà phê tụ tập cùng bạn thân - Giảm căng thẳng, chia sẻ niềm vui):</div>
                    <div class="topic-formula-text">
                        → On this day, <u>I make a point of hanging out with my close friends</u> at <span class="formula-bracket-hl">[địa điểm thư giãn]</span>. Catching up with them allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives me a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Ở nhà nấu món ngon & xem phim cùng gia đình - Tận hưởng không gian ấm cúng, bình yên):</div>
                    <div class="topic-formula-text">
                        → Most of the time, <u>I prefer staying at home to</u> <span class="formula-bracket-hl">[hoạt động tại nhà 1 - Vo]</span> and <span class="formula-bracket-hl">[hoạt động tại nhà 2 - Vo]</span>. It's an ideal way to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc thói quen & Ưu tiên ngày nghỉ]:",
                        items: [
                            { en: "make a point of hanging out with close friends", vn: "luôn chủ động dành thời gian tụ tập cùng bạn thân" },
                            { en: "catch up with them", vn: "gặp gỡ hàn huyên, cập nhật cuộc sống cùng nhau" },
                            { en: "prefer staying at home to [Vo]", vn: "thích ở nhà để làm gì hơn" },
                            { en: "it's an ideal way to [Vo]", vn: "đó là cách thức lý tưởng để..." }
                        ]
                    },
                    {
                        title: "☕ [Không gian thư giãn & Hoạt động gia đình]:",
                        items: [
                            { en: "a cozy coffee shop", vn: "một quán cà phê ấm cúng" },
                            { en: "a peaceful riverside cafe", vn: "quán cà phê yên ả ven sông" },
                            { en: "cook delicious meals from scratch", vn: "tự tay nấu các bữa ăn ngon tại nhà" },
                            { en: "watch captivating movies with my family", vn: "xem những bộ phim hấp dẫn cùng gia đình" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>relieve daily stress, cherish warm moments, foster closer bonds...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Gắn kết & An yên]:",
                        items: [
                            { en: "share lots of genuine laughter together", vn: "cùng nhau sẻ chia những tiếng cười chân thành" },
                            { en: "enjoy a truly peaceful and unhurried atmosphere", vn: "tận hưởng bầu không khí êm đềm, thực sự không vội vã" },
                            { en: "strengthen family bonding over meals", vn: "thắt chặt tình cảm gia đình qua những mâm cơm" },
                            { en: "disconnect from work emails and notifications", vn: "ngắt kết nối khỏi email công việc và các thông báo" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Đi cà phê với bạn thân - Giải tỏa stress, sẻ chia tiếng cười và niềm vui)",
                        text: "On this day, I make a point of hanging out with my close friends at a cozy coffee shop. Catching up with them allows me to relieve daily stress and gives me a chance to share lots of laughter together.",
                        formatted: `→ On this day, <u>I make a point of hanging out with my close friends</u> at <span class="sub-hl">a cozy coffee shop</span>. Catching up with them allows me to <span class="sub-hl">relieve daily stress</span> and gives me a chance to <span class="sub-hl">share lots of laughter together</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Ở nhà nấu ăn & xem phim cùng gia đình - Lưu giữ khoảnh khắc ấm cúng, thư thái)",
                        text: "Most of the time, I prefer staying at home to cook delicious meals and watch movies with my family. It's an ideal way to cherish warm moments and enjoy a truly peaceful atmosphere.",
                        formatted: `→ Most of the time, <u>I prefer staying at home to</u> <span class="sub-hl">cook delicious meals and watch movies with my family</span>. It's an ideal way to <span class="sub-hl">cherish warm moments</span> and <span class="sub-hl">enjoy a truly peaceful atmosphere</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "How important is it to have a favorite day of the week?",
                qType: "Wh-question: How important is it to [verb]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Có ý nghĩa to lớn - Tạo động lực tinh thần, giúp làm việc hiệu quả suốt tuần):</div>
                    <div class="topic-formula-text">
                        → From my perspective, <u>having a favorite day is of great significance</u> because it gives people <span class="formula-bracket-hl">[động lực tinh thần]</span>. It allows us to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and motivates us to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Thiết yếu cho sức khỏe tinh thần - Giúp tái tạo năng lượng, tránh nguy cơ kiệt sức):</div>
                    <div class="topic-formula-text">
                        → Without doubt, <u>it's truly essential for our mental well-being</u>. Having a dedicated day to unwind allows people to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and prevents them from <span class="formula-bracket-hl">[nguy cơ kiệt sức - V-ing]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc nhấn mạnh tầm quan trọng]:",
                        items: [
                            { en: "having a favorite day is of great significance", vn: "có một ngày yêu thích mang ý nghĩa vô cùng to lớn" },
                            { en: "it's truly essential for our mental well-being", vn: "điều đó thực sự thiết yếu đối với sức khỏe tinh thần của chúng ta" },
                            { en: "having a dedicated day to unwind", vn: "có riêng một ngày chuyên để xả hơi thư giãn" },
                            { en: "prevents them from suffering from burnout", vn: "ngăn họ khỏi bị rơi vào tình trạng kiệt sức" }
                        ]
                    },
                    {
                        title: "🎯 [Động lực tinh thần & Năng suất làm việc]:",
                        items: [
                            { en: "something positive to look forward to", vn: "điều gì đó tích cực đáng để mong ngóng" },
                            { en: "stay focused and motivated", vn: "giữ vững sự tập trung và động lực" },
                            { en: "work more productively throughout the week", vn: "làm việc năng suất hơn trong suốt cả tuần" },
                            { en: "suffer from burnout and severe stress", vn: "bị kiệt sức và căng thẳng nghiêm trọng" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>recharge their energy, stay productive, maintain mental wellness...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Động lực & Cân bằng]:",
                        items: [
                            { en: "break the monotony of daily routines", vn: "phá tan sự đơn điệu của các lịch trình lặp lại mỗi ngày" },
                            { en: "maintain high enthusiasm for long-term goals", vn: "duy trì niềm hứng khởi cao cho các mục tiêu dài hạn" },
                            { en: "cultivate emotional resilience under pressure", vn: "nuôi dưỡng sức bền cảm xúc khi đối mặt áp lực" },
                            { en: "give our mind adequate space to refresh", vn: "cho tâm trí đủ không gian cần thiết để làm mới lại" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Ý nghĩa to lớn - Có điểm tựa tinh thần mong ngóng, duy trì động lực và sự tập trung)",
                        text: "From my perspective, having a favorite day is of great significance because it gives people something positive to look forward to. It allows us to stay focused and motivates us to work more productively throughout the week.",
                        formatted: `→ From my perspective, <u>having a favorite day is of great significance</u> because it gives people <span class="sub-hl">something positive to look forward to</span>. It allows us to <span class="sub-hl">stay focused</span> and motivates us to <span class="sub-hl">work more productively throughout the week</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Cực kỳ thiết yếu - Cho tâm trí xả hơi, nạp năng lượng và phòng tránh kiệt sức)",
                        text: "Without doubt, it's truly essential for our mental well-being. Having a dedicated day to unwind allows people to recharge their energy and prevents them from suffering from burnout and severe stress.",
                        formatted: `→ Without doubt, <u>it's truly essential for our mental well-being</u>. Having a dedicated day to unwind allows people to <span class="sub-hl">recharge their energy</span> and prevents them from <span class="sub-hl">suffering from burnout and severe stress</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 14,
        title: "Chủ đề 14: Let's talk about an evening walk",
        introText: "Let’s talk about an evening walk.",
        questions: [
            {
                qNum: 1,
                question: "Do you often go for a walk in the evening?",
                qType: "Yes/No: Do you often [Vo]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời CÓ - Hình thành thói quen tản bộ sau bữa tối, hỗ trợ tiêu hóa và thư thái đầu óc):</div>
                    <div class="topic-formula-text">
                        → Yes, definitely. <u>I make it a daily routine to take an evening stroll</u> around <span class="formula-bracket-hl">[thời điểm / tần suất]</span>. Walking after dinner allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and helps me <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời HIẾM KHI - Bận rộn công việc buổi tối, chỉ đi dạo cuối tuần để hít thở khí trời):</div>
                    <div class="topic-formula-text">
                        → Not as often as I'd like. <u>I'm usually tied up with evening tasks</u>, so I only go walking <span class="formula-bracket-hl">[thời điểm rảnh]</span>. It gives me a great opportunity to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc thói quen & Bận rộn buổi tối]:",
                        items: [
                            { en: "make it a daily routine to take an evening stroll", vn: "tạo thành thói quen hằng ngày tản bộ nhẹ nhàng vào buổi tối" },
                            { en: "tied up with evening tasks", vn: "bận ngập đầu với các công việc / bài vở buổi tối" },
                            { en: "not as often as I'd like", vn: "không thường xuyên như tôi mong muốn" },
                            { en: "gives me a great opportunity to [Vo]", vn: "mang đến cho tôi cơ hội tuyệt vời để..." }
                        ]
                    },
                    {
                        title: "🚶 [Thời điểm & Hoạt động tản bộ]:",
                        items: [
                            { en: "almost every day after dinner", vn: "hầu như mỗi ngày sau bữa tối" },
                            { en: "around eight o'clock in the evening", vn: "khoảng 8 giờ tối" },
                            { en: "on weekend nights", vn: "vào những buổi tối cuối tuần" },
                            { en: "heavy workload and deadlines", vn: "khối lượng công việc lớn và hạn chót" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>promote food digestion, clear my mind, ease mental stress...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Không khí & Tiêu hóa]:",
                        items: [
                            { en: "breathe in cool and fresh air", vn: "hít thở bầu không khí mát mẻ và trong lành" },
                            { en: "stretch my muscles after sitting all day", vn: "thư giãn cơ bắp sau cả ngày ngồi làm việc" },
                            { en: "prevent digestive discomfort after heavy meals", vn: "ngăn ngừa cảm giác đầy bụng sau bữa ăn no" },
                            { en: "prepare my body for a restful sleep", vn: "chuẩn bị cho cơ thể sẵn sàng cho giấc ngủ trọn vẹn" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời CÓ - Đi dạo mỗi tối sau bữa ăn, thúc đẩy tiêu hóa và thư thái đầu óc)",
                        text: "Yes, definitely. I make it a daily routine to take an evening stroll almost every day after dinner. Walking allows me to promote food digestion and helps me clear my mind after long working hours.",
                        formatted: `→ Yes, definitely. <u>I make it a daily routine to take an evening stroll</u> <span class="sub-hl">almost every day after dinner</span>. Walking allows me to <span class="sub-hl">promote food digestion</span> and helps me <span class="sub-hl">clear my mind after long working hours</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời HIẾM KHI - Bận làm việc buổi tối, chỉ đi dạo cuối tuần để hít thở khí trời)",
                        text: "Not as often as I'd like. I'm usually tied up with evening work, so I only go walking on weekend nights. It gives me a great opportunity to breathe in fresh air and ease mental stress.",
                        formatted: `→ Not as often as I'd like. <u>I'm usually tied up with evening work</u>, so I only go walking <span class="sub-hl">on weekend nights</span>. It gives me a great opportunity to <span class="sub-hl">breathe in fresh air</span> and <span class="sub-hl">ease mental stress</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "Where do you often go for a walk?",
                qType: "Wh-question: Where do you often [Vo]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Công viên công cộng gần nhà - Nhiều bóng cây xanh và đường tản bộ an toàn, thoáng mát):</div>
                    <div class="topic-formula-text">
                        → <u>My go-to spot is a public park located right near my house</u> because it features <span class="formula-bracket-hl">[đặc điểm nổi bật]</span>. Strolling there allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> in a <span class="formula-bracket-hl">[tính từ không gian]</span> environment.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Khu phố yên tĩnh quanh nơi ở - Tiện lợi, không tốn thời gian di chuyển trong khói bụi):</div>
                    <div class="topic-formula-text">
                        → Most of the time, <u>I simply walk around my quiet neighborhood</u> because it's exceptionally <span class="formula-bracket-hl">[tính từ]</span>. It allows me to <span class="formula-bracket-hl">[lợi ích - Vo]</span> without having to <span class="formula-bracket-hl">[hành động phiền toái - V-ing]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc diễn đạt địa điểm & Sự tiện lợi]:",
                        items: [
                            { en: "my go-to spot is a public park located right near my house", vn: "địa điểm quen thuộc của tôi là một công viên nằm ngay gần nhà" },
                            { en: "it features lush green trees", vn: "nơi đó có những hàng cây xanh mát rượi" },
                            { en: "I simply walk around my quiet neighborhood", vn: "tôi chỉ đơn giản đi dạo quanh khu phố yên tĩnh của mình" },
                            { en: "without having to ride a motorbike", vn: "mà không phải vất vả lái xe máy" }
                        ]
                    },
                    {
                        title: "🌳 [Không gian công viên & Khu dân cư]:",
                        items: [
                            { en: "lush green trees and paved walking trails", vn: "những hàng cây xanh rợp bóng và đường đi bộ lát gạch" },
                            { en: "well-lit pathways and tranquil surroundings", vn: "những lối đi sáng sủa và không gian xung quanh tĩnh lặng" },
                            { en: "exceptionally convenient and peaceful", vn: "cực kỳ thuận tiện và thanh bình" },
                            { en: "ride a motorbike through busy traffic", vn: "lái xe máy qua những làn xe cộ tấp nập" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>enjoy the cool night breeze, stretch my legs, decompress after work...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Cảnh quan & An toàn]:",
                        items: [
                            { en: "admire the peaceful evening scenery", vn: "ngắm nhìn khung cảnh buổi tối bình yên" },
                            { en: "greet familiar and friendly neighbors", vn: "chào hỏi những người hàng xóm quen thuộc, thân thiện" },
                            { en: "avoid noisy streets and harmful exhaust fumes", vn: "tránh xa đường phố ồn ào và khói bụi độc hại" },
                            { en: "save commuting time while staying active", vn: "tiết kiệm thời gian đi lại mà vẫn duy trì vận động" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Công viên gần nhà - Nhiều cây xanh, lối đi bộ lát gạch thoáng mát và an toàn)",
                        text: "My go-to spot is a public park located right near my house because it features lush green trees and paved walking trails. Strolling there allows me to enjoy the cool night breeze in a peaceful and safe environment.",
                        formatted: `→ <u>My go-to spot is a public park located right near my house</u> because it features <span class="sub-hl">lush green trees and paved walking trails</span>. Strolling there allows me to <span class="sub-hl">enjoy the cool night breeze</span> in a <span class="sub-hl">peaceful and safe environment</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Khu phố yên tĩnh quanh nhà - Cực kỳ tiện lợi, giãn cơ bắp mà không cần đi xa)",
                        text: "Most of the time, I simply walk around my quiet neighborhood because it's exceptionally convenient. It allows me to stretch my legs and relax without having to ride a motorbike through busy traffic.",
                        formatted: `→ Most of the time, <u>I simply walk around my quiet neighborhood</u> because it's <span class="sub-hl">exceptionally convenient</span>. It allows me to <span class="sub-hl">stretch my legs and relax</span> without having to <span class="sub-hl">ride a motorbike through busy traffic</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "What are the benefits of going for a walk?",
                qType: "Wh-question: What are the benefits of [V-ing]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Góc độ thể chất - Đốt cháy calo, cải thiện tuần hoàn và giúp ngủ sâu giấc):</div>
                    <div class="topic-formula-text">
                        → From a physical perspective, <u>walking offers tremendous health benefits</u>. First, it allows people to <span class="formula-bracket-hl">[lợi ích thể lực 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích thể lực 2 - Vo]</span>. Moreover, it enables them to <span class="formula-bracket-hl">[lợi ích giấc ngủ - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Góc độ tinh thần - Giải tỏa căng thẳng, tĩnh tâm và phục hồi tinh thần sau ngày bận rộn):</div>
                    <div class="topic-formula-text">
                        → In terms of mental well-being, <u>an evening walk acts as an effective stress reliever</u>. It allows walkers to <span class="formula-bracket-hl">[lợi ích tinh thần 1 - Vo]</span> while <span class="formula-bracket-hl">[lợi ích tinh thần 2 - V-ing]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc phân tích lợi ích thể chất & Tinh thần]:",
                        items: [
                            { en: "from a physical perspective", vn: "xét từ góc độ thể chất" },
                            { en: "walking offers tremendous health benefits", vn: "đi bộ mang lại những lợi ích sức khỏe to lớn" },
                            { en: "in terms of mental well-being", vn: "về mặt sức khỏe tinh thần" },
                            { en: "acts as an effective stress reliever", vn: "đóng vai trò như một phương pháp xả stress hiệu quả" }
                        ]
                    },
                    {
                        title: "🏃 [Lợi ích thể lực & Tinh thần thư thái]:",
                        items: [
                            { en: "burn excess calories and boost metabolism", vn: "đốt cháy calo dư thừa và tăng cường trao đổi chất" },
                            { en: "improve cardiovascular health and blood circulation", vn: "cải thiện tim mạch và lưu thông máu" },
                            { en: "fall asleep faster and enjoy deep rest", vn: "chìm vào giấc ngủ nhanh hơn và tận hưởng giấc ngủ sâu" },
                            { en: "release accumulated tension", vn: "giải tỏa áp lực tinh thần tích tụ" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>strengthen the immune system, clear their minds, bounce back quickly...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Sức khỏe toàn diện]:",
                        items: [
                            { en: "alleviate back and joint stiffness", vn: "làm dịu chứng đau mỏi lưng và cứng khớp" },
                            { en: "lower high blood pressure naturally", vn: "hạ huyết áp cao một cách tự nhiên" },
                            { en: "restore mental clarity for better creativity", vn: "khôi phục sự minh mẫn giúp sáng tạo tốt hơn" },
                            { en: "foster a sense of inner tranquility", vn: "nuôi dưỡng cảm giác thanh thản, an yên từ bên trong" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Lợi ích thể chất - Đốt calo, tuần hoàn máu tốt và ngủ sâu giấc hơn vào ban đêm)",
                        text: "From a physical perspective, walking offers tremendous health benefits. First, it allows people to burn excess calories and improve blood circulation. Moreover, it enables them to fall asleep faster and enjoy deep rest at night.",
                        formatted: `→ From a physical perspective, <u>walking offers tremendous health benefits</u>. First, it allows people to <span class="sub-hl">burn excess calories and improve blood circulation</span>. Moreover, it enables them to <span class="sub-hl">fall asleep faster and enjoy deep rest at night</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Lợi ích tinh thần - Phương thuốc xả stress hiệu quả, giải tỏa áp lực và thanh lọc tâm trí)",
                        text: "In terms of mental well-being, an evening walk acts as an effective stress reliever. It allows walkers to release accumulated tension while clearing their minds after a hectic workday.",
                        formatted: `→ In terms of mental well-being, <u>an evening walk acts as an effective stress reliever</u>. It allows walkers to <span class="sub-hl">release accumulated tension</span> while <span class="sub-hl">clearing their minds after a hectic workday</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 15,
        title: "Chủ đề 15: Let's talk about shopping habits",
        introText: "Let’s talk about shopping habits.",
        questions: [
            {
                qNum: 1,
                question: "Do you often go shopping?",
                qType: "Yes/No: Do you often [Vo]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời CÓ - Đi mua sắm cuối tuần, xả hơi và sắm thực phẩm tươi & nhu yếu phẩm):</div>
                    <div class="topic-formula-text">
                        → Yes, definitely. <u>I make a point of going shopping on weekends</u> to purchase <span class="formula-bracket-hl">[mặt hàng thiết yếu]</span>. It gives me a great opportunity to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and helps me <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời HIẾM KHI - Chỉ mua khi thực sự cần thiết, ưu tiên sàn TMĐT để tiết kiệm thời gian):</div>
                    <div class="topic-formula-text">
                        → To be honest, <u>I rarely go window-shopping</u> because I only make a purchase when <span class="formula-bracket-hl">[nhu cầu cấp thiết]</span>. Instead, I prefer <span class="formula-bracket-hl">[hình thức mua sắm trực tuyến]</span>, which enables me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc tần suất & Phương thức mua sắm]:",
                        items: [
                            { en: "make a point of going shopping on weekends", vn: "luôn chủ động dành thời gian đi mua sắm vào cuối tuần" },
                            { en: "rarely go window-shopping", vn: "hiếm khi đi ngắm đồ dạo phố không mục đích" },
                            { en: "order items via e-commerce platforms", vn: "đặt hàng qua các sàn thương mại điện tử" },
                            { en: "which enables me to save precious time", vn: "điều này giúp tôi tiết kiệm thời gian quý báu" }
                        ]
                    },
                    {
                        title: "🛒 [Mặt hàng & Trải nghiệm mua sắm]:",
                        items: [
                            { en: "fresh groceries and household essentials", vn: "thực phẩm tươi sống và nhu yếu phẩm gia đình" },
                            { en: "running out of essential supplies", vn: "khi đã cạn kiệt các đồ dùng thiết yếu" },
                            { en: "avoid crowded stores and checkout queues", vn: "tránh cửa hàng đông đúc và xếp hàng thanh toán" },
                            { en: "convenient door-to-door delivery", vn: "giao hàng tận nơi vô cùng tiện lợi" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>clear my mind, unwind after a demanding workweek, save precious time...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Tiện ích & Thông minh]:",
                        items: [
                            { en: "hunt for exclusive digital discount vouchers", vn: "săn các mã giảm giá độc quyền trên mạng" },
                            { en: "inspect item quality firsthand", vn: "tự tay kiểm tra chất lượng sản phẩm trực tiếp" },
                            { en: "keep daily household operations running smoothly", vn: "giữ cho sinh hoạt gia đình luôn diễn ra suôn sẻ" },
                            { en: "avoid impulse buying under store marketing pressure", vn: "tránh mua sắm bốc đồng dưới áp lực tiếp thị tại quầy" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời CÓ - Mua sắm cuối tuần, mua đồ tươi sống và thư giãn sau tuần làm việc)",
                        text: "Yes, definitely. I make a point of going shopping on weekends to purchase fresh groceries and household essentials. It gives me a great opportunity to clear my mind and helps me unwind after a demanding workweek.",
                        formatted: `→ Yes, definitely. <u>I make a point of going shopping on weekends</u> to purchase <span class="sub-hl">fresh groceries and household essentials</span>. It gives me a great opportunity to <span class="sub-hl">clear my mind</span> and helps me <span class="sub-hl">unwind after a demanding workweek</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời HIẾM KHI - Chỉ mua khi hết đồ, đặt online để tránh đông đúc và tiết kiệm thời gian)",
                        text: "To be honest, I rarely go window-shopping because I only make a purchase when running out of essential supplies. Instead, I prefer ordering items via e-commerce platforms, which enables me to avoid crowded stores and save precious time.",
                        formatted: `→ To be honest, <u>I rarely go window-shopping</u> because I only make a purchase when <span class="sub-hl">running out of essential supplies</span>. Instead, I prefer <span class="sub-hl">ordering items via e-commerce platforms</span>, which enables me to <span class="sub-hl">avoid crowded stores</span> and <span class="sub-hl">save precious time</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "In your free time, who do you often go shopping with?",
                qType: "Wh-question: Who do you often go shopping with?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Đi cùng mẹ/gia đình - Cùng lựa chọn thực phẩm dinh dưỡng và gắn kết tình cảm gia đình):</div>
                    <div class="topic-formula-text">
                        → Most of the time, <u>I truly enjoy going shopping with my mother</u>. We make a habit of <span class="formula-bracket-hl">[hành động cùng nhau]</span>, which allows us to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and gives us a chance to <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Đi cùng bạn thân - Nhận những lời khuyên thời trang đắt giá và cải thiện tâm trạng):</div>
                    <div class="topic-formula-text">
                        → Whenever I have spare time, <u>I prefer going shopping with my close friends</u>. Not only do they offer <span class="formula-bracket-hl">[lợi ích tư vấn]</span>, but they also help me <span class="formula-bracket-hl">[lợi ích tinh thần - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc thể hiện sở thích đi cùng bạn bè & Người thân]:",
                        items: [
                            { en: "truly enjoy going shopping with my mother", vn: "thực sự rất thích đi mua sắm cùng mẹ" },
                            { en: "make a habit of picking out fresh ingredients", vn: "tạo thói quen cùng chọn mua nguyên liệu tươi ngon" },
                            { en: "whenever I have spare time, I prefer...", vn: "bất cứ khi nào có thời gian rảnh, tôi thích..." },
                            { en: "not only do they offer..., but they also...", vn: "họ không chỉ đưa ra... mà còn..." }
                        ]
                    },
                    {
                        title: "👭 [Đồng hành & Tương tác mua sắm]:",
                        items: [
                            { en: "pick out nutritious ingredients together", vn: "cùng nhau lựa chọn các nguyên liệu giàu dinh dưỡng" },
                            { en: "share lovely everyday stories", vn: "tâm sự những mẩu chuyện đời thường đáng yêu" },
                            { en: "honest fashion advice and styling tips", vn: "những lời khuyên thời trang chân thành và mẹo phối đồ" },
                            { en: "lift my spirits through delightful conversations", vn: "vực dậy tinh thần qua những cuộc trò chuyện rôm rả" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>strengthen family bonds, foster closer friendships, relieve daily fatigue...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Gắn kết & Tư vấn]:",
                        items: [
                            { en: "prevent buying ill-fitting clothes", vn: "tránh mua phải những bộ trang phục không vừa vặn" },
                            { en: "share the burden of carrying heavy groceries", vn: "chia sẻ gánh nặng xách những túi đồ nặng" },
                            { en: "cherish meaningful quality time with loved ones", vn: "trân trọng khoảng thời gian chất lượng bên người thân yêu" },
                            { en: "enjoy discovering new brands together", vn: "thích thú khám phá những nhãn hàng mới cùng nhau" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Đi cùng mẹ - Cùng chọn nguyên liệu bổ dưỡng và gắn kết tình cảm qua những câu chuyện)",
                        text: "Most of the time, I truly enjoy going shopping with my mother. We make a habit of picking out nutritious ingredients together, which allows us to strengthen family bonds and gives us a chance to share lovely everyday stories.",
                        formatted: `→ Most of the time, <u>I truly enjoy going shopping with my mother</u>. We make a habit of <span class="sub-hl">picking out nutritious ingredients together</span>, which allows us to <span class="sub-hl">strengthen family bonds</span> and gives us a chance to <span class="sub-hl">share lovely everyday stories</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Đi cùng bạn thân - Nhận lời khuyên phối đồ hữu ích và nâng cao tâm trạng)",
                        text: "Whenever I have spare time, I prefer going shopping with my close friends. Not only do they offer honest fashion advice, but they also help me lift my spirits through delightful conversations.",
                        formatted: `→ Whenever I have spare time, <u>I prefer going shopping with my close friends</u>. Not only do they offer <span class="sub-hl">honest fashion advice</span>, but they also help me <span class="sub-hl">lift my spirits through delightful conversations</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Do you think that you spend too much money on shopping?",
                qType: "Yes/No: Do you think that you [verb]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời KHÔNG - Tuân thủ nghiêm ngặt danh sách mua sắm, tránh mua bốc đồng và quản lý tốt ngân sách):</div>
                    <div class="topic-formula-text">
                        → No, definitely not. <u>I strictly stick to a well-planned shopping list</u> whenever I buy things. This disciplined habit prevents me from <span class="formula-bracket-hl">[nguy cơ chi tiêu - V-ing]</span> and allows me to <span class="formula-bracket-hl">[lợi ích tài chính - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời ĐÔI KHI - Thỉnh thoảng bị cám dỗ bởi khuyến mãi lớn, nhưng đang chủ động kiểm soát chi tiêu):</div>
                    <div class="topic-formula-text">
                        → To be honest, <u>I occasionally spend a bit more than intended</u>, especially when seduced by <span class="formula-bracket-hl">[yếu tố kích cầu]</span>. However, I'm taking active steps to <span class="formula-bracket-hl">[hành động kiểm soát - Vo]</span> so that I can <span class="formula-bracket-hl">[mục tiêu tài chính - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc kỷ luật chi tiêu & Tự đánh giá]:",
                        items: [
                            { en: "strictly stick to a well-planned shopping list", vn: "tuân thủ nghiêm ngặt danh sách mua sắm đã lên kế hoạch" },
                            { en: "prevents me from making impulse purchases", vn: "ngăn tôi khỏi việc mua sắm bốc đồng" },
                            { en: "occasionally spend a bit more than intended", vn: "thỉnh thoảng chi tiêu nhiều hơn một chút so với dự tính" },
                            { en: "taking active steps to track daily expenses", vn: "đang thực hiện các bước chủ động để theo dõi chi tiêu hằng ngày" }
                        ]
                    },
                    {
                        title: "💳 [Tài chính & Cám dỗ bán hàng]:",
                        items: [
                            { en: "disciplined financial habits", vn: "thói quen tài chính có tính kỷ luật cao" },
                            { en: "seduced by massive promotional sales", vn: "bị cám dỗ bởi các đợt đại hạ giá khuyến mãi" },
                            { en: "manage my monthly budget effectively", vn: "quản lý ngân sách hằng tháng một cách hiệu quả" },
                            { en: "maintain financial security for the future", vn: "duy trì sự an toàn và vững vàng tài chính cho tương lai" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>manage my budget effectively, build a solid emergency fund, achieve financial independence...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Quản lý tiền bạc]:",
                        items: [
                            { en: "avoid falling into unnecessary credit card debt", vn: "tránh rơi vào nợ nần thẻ tín dụng không đáng có" },
                            { en: "distinguish between genuine needs and fleeting desires", vn: "phân biệt rõ giữa nhu cầu thiết yếu và ham muốn nhất thời" },
                            { en: "allocate more funds for self-development courses", vn: "dành thêm ngân sách cho các khóa học phát triển bản thân" },
                            { en: "cultivate long-term smart saving habits", vn: "nuôi dưỡng thói quen tích lũy tiết kiệm thông minh lâu dài" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời KHÔNG - Luôn lên danh sách trước để tránh mua bốc đồng và quản lý tốt ngân sách)",
                        text: "No, definitely not. I strictly stick to a well-planned shopping list whenever I buy things. This disciplined habit prevents me from making impulse purchases and allows me to manage my monthly budget effectively.",
                        formatted: `→ No, definitely not. <u>I strictly stick to a well-planned shopping list</u> whenever I buy things. This disciplined habit prevents me from <span class="sub-hl">making impulse purchases</span> and allows me to <span class="sub-hl">manage my monthly budget effectively</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời ĐÔI KHI - Đôi khi chi quá tay vì các đợt giảm giá lớn, đang nỗ lực kiểm soát)",
                        text: "To be honest, I occasionally spend a bit more than intended, especially when seduced by massive promotional sales. However, I'm taking active steps to track daily expenses so that I can maintain financial security for the future.",
                        formatted: `→ To be honest, <u>I occasionally spend a bit more than intended</u>, especially when seduced by <span class="sub-hl">massive promotional sales</span>. However, I'm taking active steps to <span class="sub-hl">track daily expenses</span> so that I can <span class="sub-hl">maintain financial security for the future</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 16,
        title: "Chủ đề 16: Let's talk about prices and shopping habits",
        introText: "Let’s talk about prices and shopping habits.",
        questions: [
            {
                qNum: 1,
                question: "Do you usually check the price before buying something? Why or why not?",
                qType: "Yes/No + Wh-question: Do you usually check the price before buying something? Why or why not?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời CÓ - So sánh các nhãn hàng để tối ưu hóa đồng tiền kiếm được và không bị hớ):</div>
                    <div class="topic-formula-text">
                        → Yes, absolutely. <u>Checking price tags is a non-negotiable rule for me</u> before making any purchase. It enables me to <span class="formula-bracket-hl">[hành động thông minh 1 - Vo]</span> and helps me <span class="formula-bracket-hl">[lợi ích tài chính 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời TÙY MÓN - Đồ ăn rẻ mua ngay không đắn đo, đồ công nghệ cao cấp mới tìm hiểu kỹ):</div>
                    <div class="topic-formula-text">
                        → Well, <u>it largely depends on the value of the product</u>. While I don't hesitate to purchase <span class="formula-bracket-hl">[mặt hàng thường nhật giá rẻ]</span>, I make sure to <span class="formula-bracket-hl">[hành động cân nhắc - Vo]</span> whenever buying <span class="formula-bracket-hl">[mặt hàng đắt đỏ]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc nguyên tắc mua sắm & Phân loại giá trị]:",
                        items: [
                            { en: "checking price tags is a non-negotiable rule for me", vn: "kiểm tra thẻ giá là nguyên tắc bất di bất dịch của tôi" },
                            { en: "it largely depends on the value of the product", vn: "điều đó phần lớn phụ thuộc vào giá trị của món hàng" },
                            { en: "while I don't hesitate to purchase...", vn: "trong khi tôi không ngần ngại mua sắm..." },
                            { en: "make sure to conduct thorough research", vn: "luôn đảm bảo tìm hiểu, nghiên cứu cẩn trọng" }
                        ]
                    },
                    {
                        title: "🏷️ [So sánh giá & Danh mục hàng hóa]:",
                        items: [
                            { en: "compare different brands and retailers", vn: "so sánh giữa các thương hiệu và nhà bán lẻ khác nhau" },
                            { en: "optimize my hard-earned money without overpaying", vn: "tối ưu hóa đồng tiền mồ hôi công sức mà không bị trả hớ" },
                            { en: "daily groceries and small snacks", vn: "thực phẩm hằng ngày và các món ăn vặt nhỏ" },
                            { en: "high-end electronics or designer clothes", vn: "thiết bị điện tử cao cấp hoặc quần áo thiết kế đắt tiền" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>manage finances wisely, avoid financial strain, secure better value for money...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Quyết định thông minh]:",
                        items: [
                            { en: "spot deceptive price markups during sales", vn: "nhận diện được các chiêu trò thổi giá ảo trong mùa giảm giá" },
                            { en: "make conscious and rational purchase choices", vn: "đưa ra những quyết định mua sắm tỉnh táo, có tính toán" },
                            { en: "find the best balance between price and quality", vn: "tìm được điểm cân bằng tốt nhất giữa giá cả và chất lượng" },
                            { en: "prevent buyers' remorse after shopping", vn: "ngăn ngừa cảm giác hối hận của người mua sau khi sắm đồ" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời CÓ - Kiểm tra giá là nguyên tắc bất di bất dịch, so sánh thương hiệu để không bị mua hớ)",
                        text: "Yes, absolutely. Checking price tags is a non-negotiable rule for me before making any purchase. It enables me to compare different brands and helps me optimize my hard-earned money without overpaying.",
                        formatted: `→ Yes, absolutely. <u>Checking price tags is a non-negotiable rule for me</u> before making any purchase. It enables me to <span class="sub-hl">compare different brands</span> and helps me <span class="sub-hl">optimize my hard-earned money without overpaying</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời TÙY MÓN - Đồ ăn nhỏ mua ngay, đồ công nghệ đắt tiền luôn nghiên cứu kỹ lưỡng)",
                        text: "Well, it largely depends on the value of the product. While I don't hesitate to purchase daily groceries and small snacks, I make sure to conduct thorough research whenever buying high-end electronics or designer clothes.",
                        formatted: `→ Well, <u>it largely depends on the value of the product</u>. While I don't hesitate to purchase <span class="sub-hl">daily groceries and small snacks</span>, I make sure to <span class="sub-hl">conduct thorough research</span> whenever buying <span class="sub-hl">high-end electronics or designer clothes</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "With the increase in prices, do you think more carefully before making a purchase? Why?",
                qType: "Yes/No + Wh-question: With the increase in prices, do you think more carefully? Why?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời CÓ - Chi phí sinh hoạt leo thang, ưu tiên nhu yếu phẩm và cắt giảm chi tiêu xa xỉ để lập quỹ dự phòng):</div>
                    <div class="topic-formula-text">
                        → Yes, definitely. <u>Given the continuous rise in living costs</u>, I've become much more cautious with my spending. I prioritize <span class="formula-bracket-hl">[nhu cầu thiết yếu]</span> while cutting down on <span class="formula-bracket-hl">[khoản chi xa xỉ]</span> so that I can <span class="formula-bracket-hl">[mục tiêu an toàn - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời CÓ - Lạm phát buộc phải đắn đo, so sánh giá nhiều nơi và săn mã giảm giá):</div>
                    <div class="topic-formula-text">
                        → Yes, without doubt. <u>Price inflation forces me to think twice</u> before tapping my card. I actively <span class="formula-bracket-hl">[hành động so sánh]</span>, which allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc ứng phó bão giá & Thắt chặt chi tiêu]:",
                        items: [
                            { en: "given the continuous rise in living costs", vn: "xét trong bối cảnh chi phí sinh hoạt liên tục tăng cao" },
                            { en: "I've become much more cautious with my spending", vn: "tôi đã trở nên cẩn trọng hơn rất nhiều trong chi tiêu" },
                            { en: "price inflation forces me to think twice", vn: "lạm phát giá cả buộc tôi phải suy nghĩ đắn đo kỹ càng" },
                            { en: "hunt for promotion codes and seasonal discounts", vn: "săn lùng các mã khuyến mãi và giảm giá theo mùa" }
                        ]
                    },
                    {
                        title: "📈 [Lạm phát & Quản lý ngân sách]:",
                        items: [
                            { en: "basic necessities and nutritious food", vn: "các nhu yếu phẩm cơ bản và thực phẩm dinh dưỡng" },
                            { en: "cut down on non-essential entertainment and luxury goods", vn: "cắt giảm chi tiêu giải trí không cần thiết và hàng xa xỉ" },
                            { en: "build a solid financial safety net", vn: "xây dựng một tấm lưới bảo vệ tài chính vững chắc" },
                            { en: "maintain a comfortable and stress-free lifestyle", vn: "duy trì một lối sống thoải mái, không vướng bận âu lo" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>cut living expenses, overcome inflation challenges, build financial resilience...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Ứng phó lạm phát]:",
                        items: [
                            { en: "cushion against unexpected medical emergencies", vn: "tạo tấm đệm dự phòng trước các sự cố y tế bất ngờ" },
                            { en: "curb reckless consumption habits", vn: "kìm hãm những thói quen tiêu dùng bừa bãi, vô độ" },
                            { en: "master the art of frugal living without sacrificing quality", vn: "nắm vững nghệ thuật sống tiết kiệm mà không giảm chất lượng sống" },
                            { en: "strengthen personal financial discipline", vn: "tăng cường tính kỷ luật tài chính cá nhân" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời CÓ - Chi phí sinh hoạt tăng cao, ưu tiên nhu yếu phẩm và cắt giảm đồ xa xỉ để lập quỹ dự phòng)",
                        text: "Yes, definitely. Given the continuous rise in living costs, I've become much more cautious with my spending. I prioritize basic necessities while cutting down on luxury goods so that I can build a financial safety net.",
                        formatted: `→ Yes, definitely. <u>Given the continuous rise in living costs</u>, I've become much more cautious with my spending. I prioritize <span class="sub-hl">basic necessities</span> while cutting down on <span class="sub-hl">luxury goods</span> so that I can <span class="sub-hl">build a financial safety net</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời CÓ - Lạm phát buộc phải suy nghĩ kỹ, so sánh nhiều nền tảng và săn mã giảm giá)",
                        text: "Yes, without doubt. Price inflation forces me to think twice before tapping my card. I actively compare deals across multiple platforms and hunt for promotion codes, which allows me to cut living expenses and maintain a comfortable lifestyle.",
                        formatted: `→ Yes, without doubt. <u>Price inflation forces me to think twice</u> before tapping my card. I actively <span class="sub-hl">compare deals across multiple platforms</span> and hunt for promotion codes, which allows me to <span class="sub-hl">cut living expenses</span> and <span class="sub-hl">maintain a comfortable lifestyle</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "Do you think expensive products always have better quality? Why or why not?",
                qType: "Yes/No + Wh-question: Do you think expensive products always have better quality? Why or why not?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời KHÔNG HẲN - Giá cao thường do chi phí quảng cáo và giá trị thương hiệu, đồ tầm trung vẫn rất tốt):</div>
                    <div class="topic-formula-text">
                        → Not necessarily. <u>A premium price tag doesn't always guarantee superior quality</u> because much of the cost comes from <span class="formula-bracket-hl">[nguyên nhân đẩy giá]</span>. In reality, many reasonably priced products still offer <span class="formula-bracket-hl">[giá trị thực tế]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời ĐỒNG Ý PHẦN LỚN - Tiền nào của nấy, hàng cao cấp dùng chất liệu tốt, tinh xảo và bảo hành chu đáo):</div>
                    <div class="topic-formula-text">
                        → To a large extent, yes. <u>You usually get what you pay for</u> when buying high-end merchandise. Manufacturers invest heavily in <span class="formula-bracket-hl">[yếu tố chất lượng]</span>, which ensures <span class="formula-bracket-hl">[lợi ích trải nghiệm 1]</span> and provides <span class="formula-bracket-hl">[lợi ích bảo hành 2]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc đánh giá mối liên hệ giữa giá cả & Chất lượng]:",
                        items: [
                            { en: "a premium price tag doesn't always guarantee superior quality", vn: "mức giá đắt đỏ không phải lúc nào cũng bảo đảm chất lượng vượt trội" },
                            { en: "in reality, many reasonably priced products still offer...", vn: "trong thực tế, nhiều sản phẩm giá vừa phải vẫn mang lại..." },
                            { en: "you usually get what you pay for", vn: "tiền nào của nấy / bạn thường nhận được đúng giá trị với số tiền bỏ ra" },
                            { en: "manufacturers invest heavily in...", vn: "các nhà sản xuất đầu tư rất mạnh tay vào..." }
                        ]
                    },
                    {
                        title: "⭐ [Thương hiệu vs Chất lượng thực tế]:",
                        items: [
                            { en: "heavy advertising campaigns and brand prestige", vn: "các chiến dịch quảng cáo rầm rộ và uy tín thương hiệu" },
                            { en: "outstanding durability and high performance", vn: "độ bền bỉ vượt trội và hiệu năng cao" },
                            { en: "premium materials and rigorous craftsmanship", vn: "chất liệu cao cấp cùng tay nghề gia công tỉ mỉ, chuẩn xác" },
                            { en: "peace of mind with exceptional customer support", vn: "sự yên tâm tuyệt đối với dịch vụ chăm sóc khách hàng xuất sắc" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>ensure a longer product lifespan, maximize cost-efficiency, avoid deceptive marketing traps...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Giá trị tiêu dùng]:",
                        items: [
                            { en: "deliver a smoother user experience in daily life", vn: "mang lại trải nghiệm sử dụng êm ái hơn trong đời sống hằng ngày" },
                            { en: "protect consumers against counterfeit and defective goods", vn: "bảo vệ người tiêu dùng khỏi hàng giả và hàng lỗi" },
                            { en: "retain higher resale value over time", vn: "giữ được giá trị bán lại tốt hơn theo thời gian" },
                            { en: "reflect personal aesthetic taste and social status", vn: "phản ánh gu thẩm mỹ cá nhân và vị thế xã hội" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời KHÔNG HẲN - Giá đắt do quảng cáo và tên tuổi thương hiệu, đồ tầm trung vẫn có độ bền xuất sắc)",
                        text: "Not necessarily. A premium price tag doesn't always guarantee superior quality because much of the cost comes from heavy advertising campaigns and brand prestige. In reality, many reasonably priced products still offer outstanding durability and high performance.",
                        formatted: `→ Not necessarily. <u>A premium price tag doesn't always guarantee superior quality</u> because much of the cost comes from <span class="sub-hl">heavy advertising campaigns and brand prestige</span>. In reality, many reasonably priced products still offer <span class="sub-hl">outstanding durability and high performance</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời ĐỒNG Ý PHẦN LỚN - Tiền nào của nấy, hàng cao cấp có chất liệu tốt, gia công tinh xảo và bảo hành chu đáo)",
                        text: "To a large extent, yes. You usually get what you pay for when buying high-end merchandise. Manufacturers invest heavily in premium materials and rigorous craftsmanship, which ensures a longer lifespan and provides peace of mind with exceptional customer support.",
                        formatted: `→ To a large extent, yes. <u>You usually get what you pay for</u> when buying high-end merchandise. Manufacturers invest heavily in <span class="sub-hl">premium materials and rigorous craftsmanship</span>, which ensures <span class="sub-hl">a longer lifespan</span> and provides <span class="sub-hl">peace of mind with exceptional customer support</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 17,
        title: "Chủ đề 17: Let's talk about traveling",
        introText: "Let’s talk about traveling.",
        questions: [
            {
                qNum: 1,
                question: "Do you like travelling?",
                qType: "Yes/No: Do you like [noun/V-ing]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Trả lời CÓ - Đam mê du lịch, khám phá nền văn hóa mới và mở mang tầm mắt):</div>
                    <div class="topic-formula-text">
                        → Yes, definitely. <u>I'm an avid traveler</u> because exploring new destinations allows me to <span class="formula-bracket-hl">[hoạt động trải nghiệm - Vo]</span>. It gives me a great opportunity to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Trả lời KHÔNG - Dễ bị say xe trên những chuyến đi dài, chuộng kỳ nghỉ tại gia yên tĩnh):</div>
                    <div class="topic-formula-text">
                        → Honestly, not really. <u>I easily suffer from severe motion sickness</u> on long journeys, which leaves me totally exhausted. Therefore, I prefer <span class="formula-bracket-hl">[hình thức nghỉ ngơi tại nhà]</span>, which allows me to <span class="formula-bracket-hl">[lợi ích - Vo]</span> peacefully.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc bày tỏ sở thích du lịch & Cảm giác cá nhân]:",
                        items: [
                            { en: "I'm an avid traveler", vn: "tôi là một người có niềm đam mê du lịch mãnh liệt" },
                            { en: "immerse myself in local cultures", vn: "hòa mình trọn vẹn vào các nền văn hóa địa phương" },
                            { en: "suffer from severe motion sickness", vn: "bị chứng say tàu xe nghiêm trọng" },
                            { en: "enjoy quiet staycations at home", vn: "tận hưởng những kỳ nghỉ tại gia thanh bình" }
                        ]
                    },
                    {
                        title: "✈️ [Trải nghiệm khám phá & Trạng thái di chuyển]:",
                        items: [
                            { en: "breathtaking natural landscapes", vn: "những danh lam thắng cảnh thiên nhiên đẹp ngỡ ngàng" },
                            { en: "authentic regional cuisines", vn: "các món ăn đặc sản vùng miền chuẩn vị" },
                            { en: "exhausting long-haul flights and bus rides", vn: "những chuyến bay hay chuyến xe đường dài mệt mỏi" },
                            { en: "reconnect with inner peace", vn: "kết nối lại với sự bình yên trong tâm hồn" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>broaden my horizons, recharge my batteries, relieve daily stress...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Khám phá & Trải nghiệm]:",
                        items: [
                            { en: "step out of my comfort zone", vn: "bước ra khỏi vùng an toàn của bản thân" },
                            { en: "gain deeper cultural appreciation", vn: "thấu hiểu và trân trọng sâu sắc hơn nét đẹp văn hóa" },
                            { en: "capture memorable travel photographs", vn: "ghi lại những bức ảnh kỷ niệm du lịch tuyệt đẹp" },
                            { en: "avoid hectic transit delays and jet lag", vn: "tránh được sự chậm trễ chuyển tiếp mệt mỏi và chứng lệch múi giờ" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Trả lời CÓ - Khám phá điểm đến mới, hòa mình vào văn hóa bản địa và mở mang tầm mắt)",
                        text: "Yes, definitely. I'm an avid traveler because exploring new destinations allows me to immerse myself in local cultures. It gives me a great opportunity to broaden my horizons and recharge my batteries after long workdays.",
                        formatted: `→ Yes, definitely. <u>I'm an avid traveler</u> because exploring new destinations allows me to <span class="sub-hl">immerse myself in local cultures</span>. It gives me a great opportunity to <span class="sub-hl">broaden my horizons</span> and <span class="sub-hl">recharge my batteries after long workdays</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Trả lời KHÔNG - Hay bị say tàu xe đường dài, thích kỳ nghỉ tại nhà yên tĩnh để xả hơi)",
                        text: "Honestly, not really. I easily suffer from severe motion sickness on long journeys, which leaves me totally exhausted. Therefore, I prefer enjoying quiet staycations at home, which allows me to unwind without any traveling stress peacefully.",
                        formatted: `→ Honestly, not really. <u>I easily suffer from severe motion sickness</u> on long journeys, which leaves me totally exhausted. Therefore, I prefer <span class="sub-hl">enjoying quiet staycations at home</span>, which allows me to <span class="sub-hl">unwind without any traveling stress</span> peacefully.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "Do you like to travel alone or in a group?",
                qType: "Choice question: Do you like to travel [alone] or [in a group]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Đi theo nhóm - Chia sẻ chi phí, hỗ trợ lẫn nhau và nhân đôi niềm vui cùng bạn bè/gia đình):</div>
                    <div class="topic-formula-text">
                        → Personally, <u>I lean towards traveling in a group</u> with my close friends or family. Exploring places together enables us to <span class="formula-bracket-hl">[hành động hỗ trợ 1 - Vo]</span> while <span class="formula-bracket-hl">[lợi ích gắn kết 2 - V-ing]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Đi một mình - Toàn quyền quyết định lịch trình, không phụ thuộc và tự do trải nghiệm theo nhịp riêng):</div>
                    <div class="topic-formula-text">
                        → Without doubt, <u>I'm much more drawn to solo traveling</u> because it gives me absolute freedom. I can <span class="formula-bracket-hl">[sự chủ động - Vo]</span> without having to <span class="formula-bracket-hl">[sự gò bó - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc lựa chọn hình thức du lịch]:",
                        items: [
                            { en: "lean towards traveling in a group", vn: "có xu hướng nghiêng về việc đi du lịch theo nhóm" },
                            { en: "drawn to solo traveling", vn: "bị cuốn hút bởi việc đi du lịch một mình" },
                            { en: "tailor the itinerary to my own liking", vn: "tự thiết kế lịch trình hoàn toàn theo ý thích cá nhân" },
                            { en: "compromise with other people's preferences", vn: "phải thỏa hiệp với sở thích của người khác" }
                        ]
                    },
                    {
                        title: "👥 [Đồng hành & Tự do khám phá]:",
                        items: [
                            { en: "split travel expenses and accommodation costs", vn: "chia đều chi phí đi lại và tiền phòng ở" },
                            { en: "unforgettable shared memories", vn: "những kỷ niệm chung khó quên" },
                            { en: "spontaneous detours and flexible pace", vn: "những chuyến rẽ hướng ngẫu hứng và nhịp độ linh hoạt" },
                            { en: "foster self-reliance and independence", vn: "nuôi dưỡng sự tự lực và tính độc lập" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>strengthen interpersonal bonds, boost self-confidence, enjoy personal freedom...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Đi nhóm & Đi đơn]:",
                        items: [
                            { en: "ensure safety and security in unfamiliar areas", vn: "đảm bảo an toàn và an ninh ở những vùng đất xa lạ" },
                            { en: "take candid photos of each other effortlessly", vn: "chụp những bức ảnh tự nhiên cho nhau một cách dễ dàng" },
                            { en: "disconnect from social obligations completely", vn: "hoàn toàn ngắt kết nối khỏi các nghĩa vụ xã giao" },
                            { en: "make new local friends more easily on the road", vn: "dễ dàng kết thêm bạn mới địa phương trên đường đi" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Đi theo nhóm bạn thân/gia đình - Chia sẻ chi phí và lưu giữ những kỷ niệm đẹp cùng nhau)",
                        text: "Personally, I lean towards traveling in a group with my close friends or family. Exploring places together enables us to split travel expenses while creating unforgettable shared memories through mutual support.",
                        formatted: `→ Personally, <u>I lean towards traveling in a group</u> with my close friends or family. Exploring places together enables us to <span class="sub-hl">split travel expenses</span> while <span class="sub-hl">creating unforgettable shared memories through mutual support</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Đi một mình - Tự do tuyệt đối, thiết kế lịch trình theo ý mình mà không cần thỏa hiệp)",
                        text: "Without doubt, I'm much more drawn to solo traveling because it gives me absolute freedom. I can tailor the itinerary to my own liking without having to compromise with other people's preferences.",
                        formatted: `→ Without doubt, <u>I'm much more drawn to solo traveling</u> because it gives me absolute freedom. I can <span class="sub-hl">tailor the itinerary to my own liking</span> without having to <span class="sub-hl">compromise with other people's preferences</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "In which season do you prefer to travel?",
                qType: "Wh-question: In which season do you prefer to travel?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Mùa thu - Thời tiết se lạnh, dịu mát, cảnh sắc lãng mạn và tránh mùa cao điểm đông đúc):</div>
                    <div class="topic-formula-text">
                        → In my opinion, <u>autumn is hands down the best time to travel</u> because the weather is pleasantly mild. It allows travelers to <span class="formula-bracket-hl">[hoạt động ngoài trời - Vo]</span> without <span class="formula-bracket-hl">[sự khó chịu - V-ing]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Mùa hè - Nắng rực rỡ, lý tưởng cho các chuyến nghỉ dưỡng biển và tham gia thể thao dưới nước):</div>
                    <div class="topic-formula-text">
                        → Personally, <u>I have a strong preference for summer trips</u> because of the bright sunshine. It creates ideal conditions to <span class="formula-bracket-hl">[hoạt động biển 1 - Vo]</span> and <span class="formula-bracket-hl">[hoạt động biển 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc bày tỏ thời điểm du lịch yêu thích]:",
                        items: [
                            { en: "autumn is hands down the best time to travel", vn: "mùa thu chắc chắn là thời điểm tuyệt vời nhất để du lịch" },
                            { en: "have a strong preference for summer trips", vn: "đặc biệt yêu thích những chuyến đi vào mùa hè" },
                            { en: "creates ideal conditions to [Vo]", vn: "tạo điều kiện lý tưởng để làm gì" },
                            { en: "without suffering from scorching heat", vn: "mà không phải chịu đựng cái nóng gay gắt" }
                        ]
                    },
                    {
                        title: "☀️ [Thời tiết & Trải nghiệm theo mùa]:",
                        items: [
                            { en: "pleasantly mild and crisp air", vn: "không khí mát mẻ, dễ chịu và thanh mát" },
                            { en: "long scenic walks and nature exploration", vn: "những chuyến tản bộ ngắm cảnh dài và khám phá thiên nhiên" },
                            { en: "refreshing coastal waters and sandy beaches", vn: "làn nước biển mát lành và những bãi cát trắng" },
                            { en: "exciting water sports like scuba diving and surfing", vn: "các môn thể thao dưới nước hấp dẫn như lặn biển và lướt sóng" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>boost vitality, connect with nature, escape scorching weather...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Theo mùa]:",
                        items: [
                            { en: "take advantage of off-peak travel discounts", vn: "tận dụng các ưu đãi giảm giá mùa du lịch thấp điểm" },
                            { en: "capture stunning golden foliage landscapes", vn: "chụp những khung cảnh lá vàng rực rỡ tuyệt mỹ" },
                            { en: "replenish natural vitamin D under the sun", vn: "bổ sung vitamin D tự nhiên dưới ánh nắng chan hòa" },
                            { en: "avoid tourist congestion at famous landmarks", vn: "tránh được cảnh ùn ứ du khách tại các danh lam thắng cảnh" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Mùa thu - Tiết trời dịu mát, tản bộ ngắm cảnh mà không lo nắng gắt hay mưa bão)",
                        text: "In my opinion, autumn is hands down the best time to travel because the weather is pleasantly mild. It allows travelers to enjoy long scenic walks without suffering from scorching heat or sudden downpours.",
                        formatted: `→ In my opinion, <u>autumn is hands down the best time to travel</u> because the weather is pleasantly mild. It allows travelers to <span class="sub-hl">enjoy long scenic walks</span> without <span class="sub-hl">suffering from scorching heat or sudden downpours</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Mùa hè - Nắng ấm rực rỡ, lý tưởng để tắm biển và tham gia thể thao dưới nước)",
                        text: "Personally, I have a strong preference for summer trips because of the bright sunshine. It creates ideal conditions to dive into refreshing coastal waters and take part in exciting water sports.",
                        formatted: `→ Personally, <u>I have a strong preference for summer trips</u> because of the bright sunshine. It creates ideal conditions to <span class="sub-hl">dive into refreshing coastal waters</span> and <span class="sub-hl">take part in exciting water sports</span>.`
                    }
                ]
            }
        ]
    },
    {
        id: 18,
        title: "Chủ đề 18: Let's talk about holidays",
        introText: "Let’s talk about holidays.",
        questions: [
            {
                qNum: 1,
                question: "Where did you go on your last holiday?",
                qType: "Past Wh-question: Where did you go on your last holiday?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Đi du lịch biển Đà Nẵng cùng gia đình - Tận hưởng biển xanh, hải sản tươi và gắn kết tình cảm):</div>
                    <div class="topic-formula-text">
                        → On my last vacation, <u>I took a four-day trip to Da Nang with my family</u>. We made the most of our stay by <span class="formula-bracket-hl">[hoạt động nghỉ dưỡng 1 - V-ing]</span> and <span class="formula-bracket-hl">[hoạt động nghỉ dưỡng 2 - V-ing]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Về quê thăm ông bà và đại gia đình - Không gian thanh bình, tách biệt khỏi sự ngột ngạt của đô thị):</div>
                    <div class="topic-formula-text">
                        → During my recent holiday, <u>I headed back to my peaceful countryside hometown</u> to visit my grandparents. It was a wonderful opportunity to <span class="formula-bracket-hl">[hoạt động sum vầy 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích tĩnh dưỡng 2 - Vo]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc kể về kỳ nghỉ gần nhất]:",
                        items: [
                            { en: "took a four-day trip to [destination] with family", vn: "đã có một chuyến đi bốn ngày tới... cùng gia đình" },
                            { en: "made the most of our stay by [V-ing]", vn: "tận dụng tối đa chuyến đi bằng cách..." },
                            { en: "headed back to my peaceful countryside hometown", vn: "đã quay trở về quê hương nông thôn yên bình của mình" },
                            { en: "gather around cozy home-cooked meals", vn: "quây quần bên những mâm cơm gia đình ấm cúng" }
                        ]
                    },
                    {
                        title: "🏖️ [Nghỉ dưỡng biển & Sum họp miền quê]:",
                        items: [
                            { en: "stroll along pristine beaches", vn: "tản bộ dọc theo những bãi biển nguyên sơ, trong lành" },
                            { en: "savor fresh seafood at seaside restaurants", vn: "thưởng thức hải sản tươi ngon tại nhà hàng ven biển" },
                            { en: "escape the suffocating hustle of the city", vn: "thoát khỏi sự xô bồ, ngột ngạt của chốn thành thị" },
                            { en: "heartwarming conversations with elderly relatives", vn: "những cuộc trò chuyện ấm áp với người thân lớn tuổi" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>strengthen family bonds, recharge energy, find inner peace...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Kỷ niệm & Tĩnh dưỡng]:",
                        items: [
                            { en: "breathe in crisp unpolluted country air", vn: "hít thở bầu không khí làng quê trong lành, không khói bụi" },
                            { en: "strengthen generational connection through storytelling", vn: "thắt chặt sợi dây gắn kết giữa các thế hệ qua những mẩu chuyện xưa" },
                            { en: "capture candid family portraits for keepsakes", vn: "chụp những bức ảnh gia đình tự nhiên để lưu giữ kỷ niệm" },
                            { en: "unplug completely from work emails and notifications", vn: "ngắt kết nối hoàn toàn khỏi email và thông báo công việc" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Đi nghỉ mát Đà Nẵng cùng gia đình - Tản bộ bờ biển nguyên sơ và thưởng thức hải sản tươi)",
                        text: "On my last vacation, I took a four-day trip to Da Nang with my family. We made the most of our stay by strolling along pristine beaches and savoring fresh seafood at lively seaside restaurants.",
                        formatted: `→ On my last vacation, <u>I took a four-day trip to Da Nang with my family</u>. We made the most of our stay by <span class="sub-hl">strolling along pristine beaches</span> and <span class="sub-hl">savoring fresh seafood at lively seaside restaurants</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Về quê thăm ông bà - Quây quần bên mâm cơm gia đình ấm cúng và tránh xa sự ngột ngạt thành thị)",
                        text: "During my recent holiday, I headed back to my peaceful countryside hometown to visit my grandparents. It was a wonderful opportunity to gather around cozy home-cooked meals and escape the suffocating hustle of the city.",
                        formatted: `→ During my recent holiday, <u>I headed back to my peaceful countryside hometown</u> to visit my grandparents. It was a wonderful opportunity to <span class="sub-hl">gather around cozy home-cooked meals</span> and <span class="sub-hl">escape the suffocating hustle of the city</span>.`
                    }
                ]
            },
            {
                qNum: 2,
                question: "Do you like holidays?",
                qType: "Yes/No: Do you like [noun]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Rất thích kỳ nghỉ - Thời gian quý báu để phục hồi sức khỏe thể chất và nuôi dưỡng tâm hồn):</div>
                    <div class="topic-formula-text">
                        → Yes, absolutely. <u>Holidays are vital for our well-being</u> because they give us a well-deserved break from tight deadlines. Having free time allows me to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> and <span class="formula-bracket-hl">[lợi ích 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Không thích lắm - Ngày lễ các điểm du lịch quá tải, chen chúc, giá cả tăng vọt gây mệt mỏi):</div>
                    <div class="topic-formula-text">
                        → To be honest, <u>I have mixed feelings about major holidays</u>. Popular tourist attractions are consistently <span class="formula-bracket-hl">[thực trạng quá tải]</span>, which turns relaxing trips into <span class="formula-bracket-hl">[trải nghiệm mệt mỏi]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc quan điểm về ngày nghỉ lễ]:",
                        items: [
                            { en: "holidays are vital for our well-being", vn: "những kỳ nghỉ là điều thiết yếu cho sức khỏe và hạnh phúc của chúng ta" },
                            { en: "give us a well-deserved break from tight deadlines", vn: "mang lại cho ta kỳ nghỉ ngơi xứng đáng sau những hạn chót căng thẳng" },
                            { en: "I have mixed feelings about major holidays", vn: "tôi có cảm xúc lẫn lộn, không hẳn thích các kỳ nghỉ lễ lớn" },
                            { en: "turns relaxing trips into exhausting ordeals", vn: "biến những chuyến đi thư giãn thành những trải nghiệm đầy mệt mỏi" }
                        ]
                    },
                    {
                        title: "🌴 [Tái tạo năng lượng & Quá tải mùa lễ]:",
                        items: [
                            { en: "catch up on quality sleep", vn: "ngủ bù cho đủ giấc và sâu giấc" },
                            { en: "pursue personal passions without feeling rushed", vn: "theo đuổi đam mê cá nhân mà không phải vội vã" },
                            { en: "packed with noisy crowds and sky-high prices", vn: "chật ních đám đông ồn ào và giá cả trên trời" },
                            { en: "unreasonable price surges for services", vn: "tình trạng giá dịch vụ bị đẩy lên cao vô lý" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>recharge energy, maintain work-life balance, prevent chronic burnout...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Cân bằng cuộc sống]:",
                        items: [
                            { en: "reset mental focus before launching new projects", vn: "cài đặt lại sự tập trung của tâm trí trước khi khởi động dự án mới" },
                            { en: "spend uninterrupted hours with children and parents", vn: "dành trọn những giờ phút không bị gián đoạn bên con cái và cha mẹ" },
                            { en: "avoid unnecessary travel expenditures during peak seasons", vn: "tránh các khoản chi tiêu du lịch đắt đỏ không cần thiết trong mùa cao điểm" },
                            { en: "practice mindfulness and slow living at home", vn: "thực hành chánh niệm và lối sống chậm rãi, bình thản tại gia" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Rất thích - Khoảng nghỉ xứng đáng khỏi deadline, ngủ sâu giấc và theo đuổi đam mê)",
                        text: "Yes, absolutely. Holidays are vital for our well-being because they give us a well-deserved break from tight deadlines. Having free time allows me to catch up on quality sleep and pursue personal passions without feeling rushed.",
                        formatted: `→ Yes, absolutely. <u>Holidays are vital for our well-being</u> because they give us a well-deserved break from tight deadlines. Having free time allows me to <span class="sub-hl">catch up on quality sleep</span> and <span class="sub-hl">pursue personal passions without feeling rushed</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Không hẳn thích - Điểm du lịch ngày lễ đông nghịt, giá cả đắt đỏ biến chuyến đi thành mệt mỏi)",
                        text: "To be honest, I have mixed feelings about major holidays. Popular tourist attractions are consistently packed with noisy crowds and sky-high prices, which turns relaxing trips into exhausting ordeals.",
                        formatted: `→ To be honest, <u>I have mixed feelings about major holidays</u>. Popular tourist attractions are consistently <span class="sub-hl">packed with noisy crowds and sky-high prices</span>, which turns relaxing trips into <span class="sub-hl">exhausting ordeals</span>.`
                    }
                ]
            },
            {
                qNum: 3,
                question: "What do people in your country usually do during holidays?",
                qType: "Wh-question: What do people usually do during [holiday]?",
                formula: `<div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 1 (Về quê đoàn tụ với cha mẹ, cùng nấu các mâm cơm cổ truyền và thăm viếng họ hàng):</div>
                    <div class="topic-formula-text">
                        → In my country, <u>the vast majority of people choose to return to their hometowns</u>. They place high value on <span class="formula-bracket-hl">[hoạt động truyền thống 1 - V-ing]</span>, which helps <span class="formula-bracket-hl">[lợi ích gắn kết 2 - Vo]</span>.
                    </div>
                </div>
                <div class="topic-formula-row">
                    <div class="topic-formula-title">- Cách 2 (Giới trẻ và các gia đình thành thị chọn đi nghỉ dưỡng ở biển hoặc núi để giải tỏa áp lực):</div>
                    <div class="topic-formula-text">
                        → On the other hand, <u>many modern families and young people opt for getaway trips</u> to famous destinations. Taking short vacations allows them to <span class="formula-bracket-hl">[lợi ích 1 - Vo]</span> while <span class="formula-bracket-hl">[lợi ích 2 - V-ing]</span>.
                    </div>
                </div>`,
                vocabGroups: [
                    {
                        title: "🌟 [Cấu trúc miêu tả hoạt động cộng đồng trong dịp lễ]:",
                        items: [
                            { en: "the vast majority of people choose to return home", vn: "đại đa số người dân đều lựa chọn trở về quê nhà" },
                            { en: "place high value on preparing traditional feasts", vn: "rất coi trọng việc tự tay chuẩn bị những mâm cỗ truyền thống" },
                            { en: "opt for getaway trips to coastal cities", vn: "lựa chọn các chuyến đi nghỉ dưỡng tới những thành phố biển" },
                            { en: "soaking in vibrant festive vibes", vn: "hòa mình trọn vẹn vào bầu không khí lễ hội sôi động" }
                        ]
                    },
                    {
                        title: "🎉 [Nét đẹp cổ truyền & Nghỉ dưỡng hiện đại]:",
                        items: [
                            { en: "preparing traditional feasts and visiting ancestral graves", vn: "chuẩn bị những mâm cỗ truyền thống và đi viếng mộ tổ tiên" },
                            { en: "preserve core cultural traditions across generations", vn: "bảo tồn các giá trị truyền thống cốt lõi qua các thế hệ" },
                            { en: "famous coastal cities or mountain retreats", vn: "các thành phố biển nổi tiếng hoặc các khu nghỉ dưỡng trên núi" },
                            { en: "decompress from hectic work routines", vn: "xả hơi thư giãn khỏi những guồng quay công việc bộn bề" }
                        ]
                    },
                    {
                        type: "note",
                        title: "⭐ [Kho Lợi Ích B2]:",
                        note: `Kết hợp các cụm từ đắt giá tại <button type="button" onclick="switchTab('benefits')" style="background: none; border: none; padding: 0; color: #d946ef; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; font-family: inherit;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Bảng Lợi Ích</button> (Ví dụ: <em>strengthen communal spirit, recharge batteries, enrich life experience...</em>).`
                    },
                    {
                        title: "💡 [GỢI Ý LỢI ÍCH THÊM (không có trong BẢNG LỢI ÍCH) - Văn hóa & Du lịch]:",
                        items: [
                            { en: "exchange heartfelt well-wishes and lucky money", vn: "trao nhau những lời chúc chân thành và tiền lì xì may mắn" },
                            { en: "support local tourism and hospitality businesses", vn: "ủng hộ ngành du lịch và dịch vụ lưu trú địa phương" },
                            { en: "strengthen neighborhood solidarity through community festivals", vn: "thắt chặt tình làng nghĩa xóm qua các lễ hội cộng đồng" },
                            { en: "gain fresh inspiration for career achievements", vn: "nạp thêm nguồn cảm hứng mới mẻ cho sự nghiệp" }
                        ]
                    }
                ],
                samples: [
                    {
                        label: "Bài mẫu Cách 1 (Về quê sum họp gia đình - Nấu mâm cỗ truyền thống, giữ gìn nét đẹp văn hóa qua các thế hệ)",
                        text: "In my country, the vast majority of people choose to return to their hometowns. They place high value on preparing traditional feasts and visiting ancestral graves, which helps preserve core cultural traditions across generations.",
                        formatted: `→ In my country, <u>the vast majority of people choose to return to their hometowns</u>. They place high value on <span class="sub-hl">preparing traditional feasts and visiting ancestral graves</span>, which helps <span class="sub-hl">preserve core cultural traditions across generations</span>.`
                    },
                    {
                        label: "Bài mẫu Cách 2 (Đi nghỉ dưỡng biển/núi - Xả stress khỏi công việc bộn bề và hòa mình vào không khí lễ hội sôi động)",
                        text: "On the other hand, many modern families and young people opt for getaway trips to famous coastal cities or mountain retreats. Taking short vacations allows them to decompress from hectic work routines while soaking in vibrant festive vibes.",
                        formatted: `→ On the other hand, <u>many modern families and young people opt for getaway trips</u> to famous coastal cities or mountain retreats. Taking short vacations allows them to <span class="sub-hl">decompress from hectic work routines</span> while <span class="sub-hl">soaking in vibrant festive vibes</span>.`
                    }
                ]
            }
        ]
    }
];

// ==========================================================================
// TOPIC PERMISSIONS & ACCESS CONTROL (CLASS B212 vs TEACHER)
// ==========================================================================
window.isTopicUnlocked = (topicId) => {
    const tid = parseInt(topicId);
    if (window._currentUserRole === 'teacher') {
        return practiceTopicsData.some(t => t.id === tid);
    }
    // Unlocked topics 1 to 18
    return tid >= 1 && tid <= 18;
};

window.getAllowedTopicIds = () => {
    if (window._currentUserRole === 'teacher') {
        return practiceTopicsData.map(t => t.id);
    }
    // Unlocked topics 1 to 18
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
};

window.getAllowedTopicsData = () => {
    const allowedIds = window.getAllowedTopicIds();
    return practiceTopicsData.filter(t => allowedIds.includes(t.id));
};

window.updateTopicSelectDropdowns = () => {
    const isTeacher = window._currentUserRole === 'teacher';
    const selects = [
        document.getElementById('practice-topic-select'),
        document.getElementById('practice-pair-topic1-select'),
        document.getElementById('practice-pair-topic2-select')
    ];

    selects.forEach((sel) => {
        if (!sel) return;
        const currentVal = sel.value;
        sel.querySelectorAll('option').forEach(opt => {
            const val = parseInt(opt.value);
            if (val >= 1 && val <= 18) {
                opt.disabled = false;
                if (val === 1) opt.textContent = "🎯 Topic 01: Let's talk about hobbies";
                if (val === 2) opt.textContent = "🎯 Topic 02: Let's talk about video games";
                if (val === 3) opt.textContent = "🎯 Topic 03: Let's talk about books";
                if (val === 4) opt.textContent = "🎯 Topic 04: Let's talk about listening to the radio";
                if (val === 5) opt.textContent = "🎯 Topic 05: Let's talk about music";
                if (val === 6) opt.textContent = "🎯 Topic 06: Let's talk about musical instruments";
                if (val === 7) opt.textContent = "🎯 Topic 07: Let's talk about restaurants";
                if (val === 8) opt.textContent = "🎯 Topic 08: Let's talk about fast food restaurants";
                if (val === 9) opt.textContent = "🎯 Topic 09: Let's talk about cooking";
                if (val === 10) opt.textContent = "🎯 Topic 10: Let's talk about the cooking class";
                if (val === 11) opt.textContent = "🎯 Topic 11: Let's talk about health";
                if (val === 12) opt.textContent = "🎯 Topic 12: Let's talk about health (part 2)";
                if (val === 13) opt.textContent = "🎯 Topic 13: Talk about your favorite day of the week";
                if (val === 14) opt.textContent = "🎯 Topic 14: Let's talk about an evening walk";
                if (val === 15) opt.textContent = "🎯 Topic 15: Let's talk about shopping habits";
                if (val === 16) opt.textContent = "🎯 Topic 16: Let's talk about prices and shopping habits";
                if (val === 17) opt.textContent = "🎯 Topic 17: Let's talk about traveling";
                if (val === 18) opt.textContent = "🎯 Topic 18: Let's talk about holidays";
            } else if (val >= 19) {
                opt.disabled = true;
            }
        });
        if (!isTeacher && parseInt(currentVal) > 18) {
            if (sel.id === 'practice-pair-topic2-select') {
                sel.value = "2";
            } else {
                sel.value = "1";
            }
        }
    });
};

window.applyClassPermissions = () => {
    window.updateTopicSelectDropdowns();
    const currentTopicSelect = document.getElementById('practice-topic-select');
    if (currentTopicSelect) {
        const currentId = parseInt(currentTopicSelect.value);
        if (!window.isTopicUnlocked(currentId)) {
            currentTopicSelect.value = "1";
            renderPracticeTopic(1);
        }
    }
    if (typeof updatePairPreview === 'function') {
        updatePairPreview();
    }
};

// ==========================================================================
// TOPIC SELECTION & RENDERING CONTROLLER
// ==========================================================================
window.switchPracticeTopic = (topicId) => {
    renderPracticeTopic(parseInt(topicId));
};

window.setTopicSelectionMode = (mode) => {
    const manualBtn = document.getElementById('topic-mode-manual-btn');
    const randomBtn = document.getElementById('topic-mode-random-btn');
    const pairBtn = document.getElementById('topic-mode-pair-btn');
    const manualPanel = document.getElementById('topic-manual-panel');
    const randomPanel = document.getElementById('topic-random-panel');
    const pairPanel = document.getElementById('topic-pair-panel');

    if (manualBtn) manualBtn.classList.toggle('active', mode === 'manual');
    if (randomBtn) randomBtn.classList.toggle('active', mode === 'random');
    if (pairBtn) pairBtn.classList.toggle('active', mode === 'pair');

    if (manualPanel) manualPanel.style.display = mode === 'manual' ? 'block' : 'none';
    if (randomPanel) randomPanel.style.display = mode === 'random' ? 'block' : 'none';
    if (pairPanel) pairPanel.style.display = mode === 'pair' ? 'block' : 'none';

    if (mode === 'manual') {
        const selectEl = document.getElementById('practice-topic-select');
        const tid = selectEl ? parseInt(selectEl.value) : 1;
        renderPracticeTopic(tid);
    } else if (mode === 'random') {
        pickRandomPracticeTopic();
    } else if (mode === 'pair') {
        initPairTopicPanel();
    }
};

window.initPairTopicPanel = () => {
    const labelEl = document.getElementById('current-topic-label');
    if (labelEl) labelEl.textContent = `Ghép 2 chủ đề (180s)`;
    updatePairPreview();
};

window.onPairTopicChange = (changedWhich) => {
    const s1 = document.getElementById('practice-pair-topic1-select');
    const s2 = document.getElementById('practice-pair-topic2-select');
    if (!s1 || !s2) return;

    let v1 = parseInt(s1.value);
    let v2 = parseInt(s2.value);

    // Ensure choices are unlocked
    if (!window.isTopicUnlocked(v1)) {
        v1 = 1;
        s1.value = "1";
    }
    if (!window.isTopicUnlocked(v2)) {
        v2 = 2;
        s2.value = "2";
    }

    if (v1 === v2) {
        const available = window.getAllowedTopicIds();
        const others = available.filter(id => id !== (changedWhich === 1 ? v1 : v2));
        if (others.length > 0) {
            if (changedWhich === 1) {
                s2.value = String(others[0]);
            } else {
                s1.value = String(others[0]);
            }
        }
    }
    updatePairPreview();
};

window.swapPairTopics = () => {
    const s1 = document.getElementById('practice-pair-topic1-select');
    const s2 = document.getElementById('practice-pair-topic2-select');
    if (!s1 || !s2) return;
    const val1 = s1.value;
    const val2 = s2.value;
    s1.value = val2;
    s2.value = val1;
    updatePairPreview();
};

window.randomizePairTopics = () => {
    const available = window.getAllowedTopicIds();
    if (available.length < 2) return;
    const rand1 = available[Math.floor(Math.random() * available.length)];
    const remain = available.filter(id => id !== rand1);
    const rand2 = remain[Math.floor(Math.random() * remain.length)];

    const s1 = document.getElementById('practice-pair-topic1-select');
    const s2 = document.getElementById('practice-pair-topic2-select');
    if (s1) s1.value = String(rand1);
    if (s2) s2.value = String(rand2);
    updatePairPreview();

    if (typeof confetti === 'function') {
        try {
            confetti({
                particleCount: 40,
                spread: 60,
                origin: { y: 0.3 }
            });
        } catch (e) {}
    }
};

window.startPairExamFromPanel = () => {
    const s1 = document.getElementById('practice-pair-topic1-select');
    const s2 = document.getElementById('practice-pair-topic2-select');
    let t1Id = s1 ? parseInt(s1.value) : 1;
    let t2Id = s2 ? parseInt(s2.value) : 2;
    if (!window.isTopicUnlocked(t1Id)) t1Id = 1;
    if (!window.isTopicUnlocked(t2Id)) t2Id = 2;
    openFullTopicExamModal(t1Id, 180, t2Id);
};

window.updatePairPreview = () => {
    const s1 = document.getElementById('practice-pair-topic1-select');
    const s2 = document.getElementById('practice-pair-topic2-select');
    const previewContainer = document.getElementById('pair-topics-preview');
    if (!s1 || !s2 || !previewContainer) return;

    let t1Id = parseInt(s1.value) || 1;
    let t2Id = parseInt(s2.value) || 2;
    if (!window.isTopicUnlocked(t1Id)) {
        t1Id = 1;
        s1.value = "1";
    }
    if (!window.isTopicUnlocked(t2Id)) {
        t2Id = 2;
        s2.value = "2";
    }

    const t1 = practiceTopicsData.find(t => t.id === t1Id) || practiceTopicsData[0];
    const t2 = practiceTopicsData.find(t => t.id === t2Id) || practiceTopicsData[1] || practiceTopicsData[0];

    const q1List = t1.questions.map(q => `
        <div style="background: var(--bg-card); border-radius: 8px; padding: 0.65rem 0.85rem; border: 1px solid var(--border); margin-bottom: 0.5rem; font-size: 0.92rem; font-weight: 600; color: var(--text-main); text-align: left;">
            <span style="color: var(--primary); font-weight: 800; margin-right: 0.35rem;">Câu ${q.qNum}:</span> ${q.question}
        </div>
    `).join('');

    const q2List = t2.questions.map(q => `
        <div style="background: var(--bg-card); border-radius: 8px; padding: 0.65rem 0.85rem; border: 1px solid var(--border); margin-bottom: 0.5rem; font-size: 0.92rem; font-weight: 600; color: var(--text-main); text-align: left;">
            <span style="color: #059669; font-weight: 800; margin-right: 0.35rem;">Câu ${q.qNum}:</span> ${q.question}
        </div>
    `).join('');

    previewContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; text-align: left;">
            <!-- Topic 1 Preview -->
            <div style="background: rgba(67, 97, 238, 0.04); border: 2px solid rgba(67, 97, 238, 0.25); border-radius: 14px; padding: 1rem 1.25rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid rgba(67, 97, 238, 0.2);">
                    <span style="font-weight: 800; color: var(--primary); font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-flag"></i> PHẦN 1: ${t1.title}
                    </span>
                    <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary); background: rgba(67, 97, 238, 0.1); padding: 0.15rem 0.5rem; border-radius: 6px;">3 câu</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; margin-bottom: 0.65rem;">
                    🗣️ Câu dẫn: "${t1.introText || t1.intro || ''}"
                </div>
                ${q1List}
            </div>

            <!-- Topic 2 Preview -->
            <div style="background: rgba(16, 185, 129, 0.04); border: 2px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 1rem 1.25rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1.5px solid rgba(16, 185, 129, 0.2);">
                    <span style="font-weight: 800; color: #059669; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-flag-checkered"></i> PHẦN 2: ${t2.title}
                    </span>
                    <span style="font-size: 0.78rem; font-weight: 700; color: #059669; background: rgba(16, 185, 129, 0.1); padding: 0.15rem 0.5rem; border-radius: 6px;">3 câu</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; margin-bottom: 0.65rem;">
                    🗣️ Câu dẫn: "${t2.introText || t2.intro || ''}"
                </div>
                ${q2List}
            </div>
        </div>
    `;
};

window.pickRandomPracticeTopic = () => {
    const available = window.getAllowedTopicIds();
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

    const selectEl = document.getElementById('practice-topic-select');
    if (selectEl) selectEl.value = String(topicId);

    if (!window.isTopicUnlocked(topicId)) {
        const labelEl = document.getElementById('current-topic-label');
        if (labelEl) labelEl.textContent = `Topic ${String(topicId).padStart(2, '0')} (Khoá)`;
        container.innerHTML = `
            <div class="f-card-clean fade-in" style="margin-bottom: 2rem; text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-card); border: 2px dashed rgba(245, 158, 11, 0.45); border-radius: 20px;">
                <div style="width: 80px; height: 80px; margin: 0 auto 1.25rem; background: rgba(245, 158, 11, 0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(245, 158, 11, 0.35);">
                    <i class="fa-solid fa-lock" style="font-size: 2.2rem; color: #d97706;"></i>
                </div>
                <h2 style="font-size: 1.4rem; font-weight: 800; color: #b45309; margin-bottom: 0.6rem;">
                    CHỦ ĐỀ ĐANG KHOÁ (CHỜ CẬP NHẬT)
                </h2>
                <p style="color: var(--text-muted); font-size: 1.05rem; max-width: 580px; margin: 0 auto 1.75rem; line-height: 1.65;">
                    Hiện tại hệ thống đã mở <strong>18 chủ đề đầu tiên (Topic 01 đến Topic 18)</strong> để các bạn luyện tập. Các chủ đề tiếp theo đang được cập nhật và sẽ mở theo lịch học của cô!
                </p>
                <div style="display: flex; justify-content: center; gap: 0.65rem; flex-wrap: wrap;">
                    <button type="button" class="btn" onclick="renderPracticeTopic(1)" style="background: var(--primary); color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(67, 97, 238, 0.25);">
                        Topic 01
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(2)" style="background: #059669; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                        Topic 02
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(3)" style="background: #8b5cf6; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);">
                        Topic 03
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(4)" style="background: #ea580c; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);">
                        Topic 04
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(5)" style="background: #ec4899; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);">
                        Topic 05
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(6)" style="background: #0284c7; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
                        Topic 06
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(7)" style="background: #0d9488; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);">
                        Topic 07
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(8)" style="background: #e11d48; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);">
                        Topic 08
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(9)" style="background: #f59e0b; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);">
                        Topic 09
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(10)" style="background: #6366f1; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">
                        Topic 10
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(11)" style="background: #10b981; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                        Topic 11
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(12)" style="background: #0ea5e9; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);">
                        Topic 12
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(13)" style="background: #8b5cf6; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);">
                        Topic 13
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(14)" style="background: #14b8a6; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);">
                        Topic 14
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(15)" style="background: #f97316; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);">
                        Topic 15
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(16)" style="background: #06b6d4; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);">
                        Topic 16
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(17)" style="background: #3b82f6; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);">
                        Topic 17
                    </button>
                    <button type="button" class="btn" onclick="renderPracticeTopic(18)" style="background: #ec4899; color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);">
                        Topic 18
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    const topic = practiceTopicsData.find(t => t.id === topicId) || practiceTopicsData[0];
    if (!topic) return;

    const labelEl = document.getElementById('current-topic-label');
    if (labelEl) labelEl.textContent = `Topic ${String(topic.id).padStart(2, '0')} / 60`;

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
                        <button class="btn-audio-sample" onclick="openFullTopicExamModal(${topic.id})" style="background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);" title="Thi thử liên tục 3 câu của chủ đề này">
                            <i class="fa-solid fa-stopwatch"></i> Thi Thử 1 Chủ Đề (90s)
                        </button>
                        <button class="btn-audio-sample" onclick="openFullPartExamModal(${topic.id})" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);" title="Thi thử chuẩn Part 1: Chủ đề này ghép cùng 1 chủ đề khác trong 3 phút">
                            <i class="fa-solid fa-layer-group"></i> Thi Thử Cả Part 1 (2 Chủ Đề - 180s)
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
                        <div class="vocab-content">
                            <strong class="vocab-en">${it.en}</strong>
                            <span class="vocab-colon">:</span>
                            <span class="vocab-vn">${it.vn}</span>
                        </div>
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
// FULL TOPIC / FULL PART EXAM SIMULATION MODAL
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

window._fullExamState = {
    mode: 'single', // 'single' (1 topic - 3 questions) | 'full' (2 topics - 6 questions)
    topic1Id: 1,
    topic2Id: 2,
    seconds: 90
};

window.renderExamQuestionsHtml = () => {
    const t1 = practiceTopicsData.find(t => t.id === window._fullExamState.topic1Id) || practiceTopicsData[0];
    const otherTopics = practiceTopicsData.filter(t => t.id !== t1.id);
    let t2 = practiceTopicsData.find(t => t.id === window._fullExamState.topic2Id);
    if (!t2 || t2.id === t1.id) {
        t2 = otherTopics[0] || t1;
        window._fullExamState.topic2Id = t2.id;
    }

    const titleEl = document.getElementById('full-exam-modal-title');
    const badgeEl = document.getElementById('full-exam-header-badge');
    const questionsContainer = document.getElementById('full-exam-questions-container');

    if (window._fullExamState.seconds === 180) {
        // Full Part 1 Mode (2 Topics - 6 questions)
        if (badgeEl) badgeEl.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> VSTEP B2 EXAM SIMULATION • FULL PART 01 (2 CHỦ ĐỀ - 6 CÂU HỎI)';
        if (titleEl) titleEl.innerHTML = `<span><i class="fa-solid fa-layer-group"></i> ${t1.title} & ${t2.title}</span>`;

        const q1Html = t1.questions.map(q => `
            <div style="background: var(--bg-card); border-radius: 10px; padding: 0.85rem 1rem; border: 1px solid var(--border); margin-bottom: 0.6rem;">
                <div style="font-weight: 800; color: var(--primary); font-size: 0.85rem; margin-bottom: 0.25rem;">CÂU HỎI ${q.qNum}:</div>
                <div style="font-size: 1.02rem; font-weight: 700; color: var(--text-main); line-height: 1.45;">${q.question}</div>
            </div>
        `).join('');

        const q2Html = t2.questions.map(q => `
            <div style="background: var(--bg-card); border-radius: 10px; padding: 0.85rem 1rem; border: 1px solid var(--border); margin-bottom: 0.6rem;">
                <div style="font-weight: 800; color: #059669; font-size: 0.85rem; margin-bottom: 0.25rem;">CÂU HỎI ${q.qNum}:</div>
                <div style="font-size: 1.02rem; font-weight: 700; color: var(--text-main); line-height: 1.45;">${q.question}</div>
            </div>
        `).join('');

        const isRec = window._fullExamTimer.isRecording;
        const allowedTopics = window.getAllowedTopicsData();
        const topicOptions1 = allowedTopics.map(t => `<option value="${t.id}" ${t.id === t1.id ? 'selected' : ''}>${t.title}</option>`).join('');
        const topicOptions2 = allowedTopics.map(t => `<option value="${t.id}" ${t.id === t2.id ? 'selected' : ''}>${t.title}</option>`).join('');

        if (questionsContainer) {
            questionsContainer.innerHTML = `
                <div style="font-size: 0.95rem; font-weight: 800; color: #ef4444; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.4rem;">
                    <i class="fa-solid fa-clipboard-list"></i> BÀI THI TOÀN DIỆN PART 1 • TRẢ LỜI LIÊN TỤC 2 CHỦ ĐỀ (6 CÂU) TRONG 3 PHÚT:
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; margin-bottom: 0.5rem;">
                    <!-- Topic 1 -->
                    <div style="background: var(--bg-body); border-radius: 14px; padding: 1.1rem; border: 2px solid rgba(67, 97, 238, 0.35);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(67, 97, 238, 0.2); flex-wrap: wrap; gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 800; color: var(--primary); font-size: 0.95rem;">
                                <i class="fa-solid fa-flag"></i> PHẦN 1:
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.4rem; flex: 1; justify-content: flex-end;">
                                <select ${isRec ? 'disabled' : ''} onchange="changeExamTopic(1, this.value)" title="Chọn chủ đề thứ nhất" style="max-width: 250px; padding: 0.35rem 0.6rem; border-radius: 8px; border: 1.5px solid var(--primary); font-weight: 700; font-size: 0.86rem; background: var(--bg-card); color: var(--text-main); cursor: pointer; outline: none;">
                                    ${topicOptions1}
                                </select>
                                <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary); background: rgba(67, 97, 238, 0.1); padding: 0.2rem 0.5rem; border-radius: 6px; white-space: nowrap;">3 câu</span>
                            </div>
                        </div>
                        ${q1Html}
                    </div>

                    <!-- Topic 2 -->
                    <div style="background: var(--bg-body); border-radius: 14px; padding: 1.1rem; border: 2px solid rgba(16, 185, 129, 0.35);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(16, 185, 129, 0.2); flex-wrap: wrap; gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 800; color: #059669; font-size: 0.95rem;">
                                <i class="fa-solid fa-flag-checkered"></i> PHẦN 2:
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.4rem; flex: 1; justify-content: flex-end;">
                                <select ${isRec ? 'disabled' : ''} onchange="changeExamTopic(2, this.value)" title="Chọn chủ đề thứ hai" style="max-width: 240px; padding: 0.35rem 0.6rem; border-radius: 8px; border: 1.5px solid #10b981; font-weight: 700; font-size: 0.86rem; background: var(--bg-card); color: var(--text-main); cursor: pointer; outline: none;">
                                    ${topicOptions2}
                                </select>
                                <button type="button" onclick="randomizeTopic2InExam()" ${isRec ? 'disabled' : ''} style="background: var(--bg-card); border: 1px solid #10b981; color: #059669; font-size: 0.78rem; font-weight: 700; padding: 0.25rem 0.55rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; white-space: nowrap;" title="Bốc ngẫu nhiên chủ đề thứ 2 khác">
                                    <i class="fa-solid fa-shuffle"></i> Đổi ngẫu nhiên
                                </button>
                            </div>
                        </div>
                        ${q2Html}
                    </div>
                </div>
            `;
        }
    } else {
        // Single Topic Mode (3 questions)
        if (badgeEl) badgeEl.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> VSTEP B2 EXAM SIMULATION • SPEAKING PART 01 (1 CHỦ ĐỀ)';
        if (titleEl) titleEl.innerHTML = `<span><i class="fa-solid fa-comments"></i> ${t1.title}</span>`;

        const qListHtml = t1.questions.map(q => `
            <div style="background: var(--bg-body); border-radius: 12px; padding: 1rem 1.25rem; border: 1px solid var(--border); margin-bottom: 0.85rem;">
                <div style="font-weight: 800; color: var(--primary); font-size: 0.92rem; margin-bottom: 0.35rem;">
                    CÂU HỎI ${q.qNum}:
                </div>
                <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); line-height: 1.5;">
                    ${q.question}
                </div>
            </div>
        `).join('');

        if (questionsContainer) {
            questionsContainer.innerHTML = `
                <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem;">
                    📋 NỘI DUNG 3 CÂU HỎI BẠN CẦN TRẢ LỜI LIÊN TỤC:
                </div>
                ${qListHtml}
            `;
        }
    }
};

window.changeExamTopic = (which, newIdStr) => {
    if (window._fullExamTimer.isRecording) return;
    const newId = parseInt(newIdStr);
    if (isNaN(newId) || !window.isTopicUnlocked(newId)) return;

    const allowed = window.getAllowedTopicsData();
    if (which === 1) {
        window._fullExamState.topic1Id = newId;
        if (window._fullExamState.topic2Id === newId) {
            const others = allowed.filter(t => t.id !== newId);
            if (others.length > 0) window._fullExamState.topic2Id = others[0].id;
        }
    } else {
        window._fullExamState.topic2Id = newId;
        if (window._fullExamState.topic1Id === newId) {
            const others = allowed.filter(t => t.id !== newId);
            if (others.length > 0) window._fullExamState.topic1Id = others[0].id;
        }
    }
    renderExamQuestionsHtml();
};

window.randomizeTopic2InExam = () => {
    if (window._fullExamTimer.isRecording) return;
    const t1Id = window._fullExamState.topic1Id;
    const allowed = window.getAllowedTopicsData();
    const candidates = allowed.filter(t => t.id !== t1Id && t.id !== window._fullExamState.topic2Id);
    if (candidates.length > 0) {
        const nextT2 = candidates[Math.floor(Math.random() * candidates.length)];
        window._fullExamState.topic2Id = nextT2.id;
    } else {
        const other = allowed.find(t => t.id !== t1Id);
        if (other) window._fullExamState.topic2Id = other.id;
    }
    renderExamQuestionsHtml();
};

window.openFullTopicExamModal = (topicId, initialSeconds = 90, topic2Id = null) => {
    stopAllActiveRecordings();
    if (!window.isTopicUnlocked(topicId)) topicId = 1;
    const allowed = window.getAllowedTopicsData();
    const t1 = allowed.find(t => t.id === topicId) || allowed[0];
    if (!t1) return;

    let t2 = topic2Id ? allowed.find(t => t.id === topic2Id) : null;
    if (!t2 || t2.id === t1.id) {
        const others = allowed.filter(t => t.id !== t1.id);
        t2 = others[Math.floor(Math.random() * others.length)] || t1;
    }

    window._fullExamState = {
        mode: initialSeconds === 180 ? 'full' : 'single',
        topic1Id: t1.id,
        topic2Id: t2.id,
        seconds: initialSeconds
    };

    window._fullExamTimer.totalTime = initialSeconds;
    window._fullExamTimer.timeLeft = initialSeconds;

    let overlay = document.getElementById('topic-full-exam-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'topic-full-exam-overlay';
        overlay.className = 'topic-full-exam-overlay';
        document.body.appendChild(overlay);
    }

    const mm = String(Math.floor(initialSeconds / 60)).padStart(2, '0');
    const ss = String(initialSeconds % 60).padStart(2, '0');

    overlay.innerHTML = `
        <div class="topic-full-exam-modal fade-in">
            <div class="topic-full-exam-header">
                <div>
                    <div id="full-exam-header-badge" style="font-size: 0.85rem; font-weight: 700; color: #ef4444; letter-spacing: 0.5px; text-transform: uppercase;">
                        <i class="fa-solid fa-microphone-lines"></i> VSTEP B2 EXAM SIMULATION • SPEAKING PART 01
                    </div>
                    <div id="full-exam-modal-title" class="topic-full-exam-title">
                        ${t1.title}
                    </div>
                </div>
                <button class="topic-full-exam-close" onclick="closeFullTopicExamModal()" title="Đóng phòng thi">&times;</button>
            </div>

            <!-- Questions Area (Dynamically rendered for 1 topic or 2 topics) -->
            <div id="full-exam-questions-container" style="margin-bottom: 1.25rem;"></div>

            <!-- Exam Console -->
            <div style="background: var(--bg-body); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 1.5rem; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted);">Thời gian thi:</span>
                    <button type="button" class="btn-time-opt ${initialSeconds === 60 ? 'active' : ''}" onclick="setFullExamTime(60, this)">60s</button>
                    <button type="button" class="btn-time-opt ${initialSeconds === 75 ? 'active' : ''}" onclick="setFullExamTime(75, this)">75s</button>
                    <button type="button" class="btn-time-opt ${initialSeconds === 90 ? 'active' : ''}" onclick="setFullExamTime(90, this)">90s (Chuẩn 1 Chủ Đề)</button>
                    <button type="button" class="btn-time-opt ${initialSeconds === 180 ? 'active' : ''}" onclick="setFullExamTime(180, this)" style="border-color: #ef4444; font-weight: 800;">
                        <i class="fa-solid fa-layer-group"></i> 180s (Chuẩn Cả Part 1: 2 Chủ Đề)
                    </button>
                </div>

                <div id="full-exam-badge" class="topic-exam-phase-badge" style="margin-bottom: 1rem;">
                    ⏱️ SẴN SÀNG VÀO THI
                </div>

                <div style="display: flex; align-items: center; justify-content: center; gap: 1.25rem; margin-bottom: 1.25rem;">
                    <div id="full-exam-digits" class="topic-exam-digits" style="font-size: 3.5rem;">${mm}:${ss}</div>
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
                    <button type="button" id="btn-full-start" class="btn-exam-rec start" onclick="startFullTopicRecording()">
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
                    <a id="full-exam-download" class="btn-exam-download">
                        <i class="fa-solid fa-download"></i> Tải bài thi của bạn (.webm)
                    </a>
                </div>
            </div>
        </div>
    `;

    renderExamQuestionsHtml();
    overlay.style.display = 'flex';
};

window.openFullPartExamModal = (preferredTopic1Id = null) => {
    const allowed = window.getAllowedTopicsData();
    let t1Id = preferredTopic1Id;
    if (!t1Id || !window.isTopicUnlocked(t1Id)) {
        const randIdx = Math.floor(Math.random() * allowed.length);
        t1Id = allowed[randIdx].id;
    }
    const otherCandidates = allowed.filter(t => t.id !== t1Id);
    let t2Id = otherCandidates[0]?.id;
    if (otherCandidates.length > 1) {
        const rand2Idx = Math.floor(Math.random() * otherCandidates.length);
        t2Id = otherCandidates[rand2Idx].id;
    } else if (!t2Id) {
        t2Id = allowed[0].id;
    }

    openFullTopicExamModal(t1Id, 180, t2Id);
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
    window._fullExamState.seconds = seconds;
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
    // Update questions display for single vs full mode
    renderExamQuestionsHtml();
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
            try {
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
                    if (window._fullExamState && window._fullExamState.seconds === 180) {
                        downloadBtn.download = `VSTEP_B2_Speaking_P1_FullTest_T${window._fullExamState.topic1Id}_T${window._fullExamState.topic2Id}_${student}.webm`;
                    } else {
                        const tid = (window._fullExamState && window._fullExamState.topic1Id) || topicId || 1;
                        downloadBtn.download = `VSTEP_B2_Speaking_P1_Topic${tid}_${student}.webm`;
                    }
                }
                if (playbackBox) playbackBox.style.display = 'flex';
            } catch (err) {
                console.error("Error finalizing exam recording:", err);
            } finally {
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
            }
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
    if (window._fullExamTimer.interval) {
        clearInterval(window._fullExamTimer.interval);
        window._fullExamTimer.interval = null;
    }

    if (!window._fullExamTimer.isRecording) {
        // Fallback: If timer already stopped but UI still shows stop button
        const startBtn = document.getElementById('btn-full-start');
        const stopBtn = document.getElementById('btn-full-stop');
        const resetBtn = document.getElementById('btn-full-reset');
        const wave = document.getElementById('full-exam-wave');
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'none';
        if (resetBtn) resetBtn.style.display = 'inline-flex';
        if (wave) wave.classList.remove('active');
        return;
    }

    window._fullExamTimer.isRecording = false;

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

// Auto-initialize topic 1 and permissions on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof updateTopicSelectDropdowns === 'function') updateTopicSelectDropdowns();
        if (typeof renderPracticeTopic === 'function') renderPracticeTopic(1);
    });
} else {
    if (typeof updateTopicSelectDropdowns === 'function') updateTopicSelectDropdowns();
    if (typeof renderPracticeTopic === 'function') renderPracticeTopic(1);
}

