# -*- coding: utf-8 -*-
import os, re

index_path = '/Users/nguyetpham/Desktop/WEBSITE/speaking-part1-b2level/index.html'
script_path = '/Users/nguyetpham/Desktop/WEBSITE/speaking-part1-b2level/script.js'

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Split "relax after a long / busy day"
old_relax = """                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #d946ef; font-weight: 800;">relax after a long / busy day</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">thư giãn sau một ngày dài / bận rộn</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('relax after a long')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>"""

new_relax = """                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #d946ef; font-weight: 800;">relax after a long day</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">thư giãn sau một ngày dài</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('relax after a long day')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>
                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #d946ef; font-weight: 800;">relax after a busy day</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">thư giãn sau một ngày bận rộn</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('relax after a busy day')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>"""

# 2. Split "widen/broaden/expand my knowledge"
old_knowledge = """                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">widen/broaden/expand my knowledge</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">mở rộng kiến thức</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('widen')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>"""

new_knowledge = """                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">widen my knowledge</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">mở rộng kiến thức</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('widen my knowledge')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>
                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">broaden my knowledge</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">mở rộng tầm hiểu biết</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('broaden my knowledge')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>
                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">expand my knowledge</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">nâng cao kiến thức sâu rộng</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('expand my knowledge')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>"""

# 3. Split "study/work more effectively"
old_study = """                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">study/work more effectively</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">học tập hoặc làm việc hiệu quả hơn</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('study')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>"""

new_study = """                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">study more effectively</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">học tập hiệu quả hơn</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('study more effectively')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>
                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">work more effectively</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">làm việc hiệu quả hơn</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('work more effectively')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>"""

# 4. Split "gain a deeper understanding of history/science/art"
old_gain = """                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">gain a deeper understanding of history/science/art</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">hiểu sâu hơn về lịch sử/khoa học/nghệ thuật</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('gain a deeper understanding of history')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>"""

new_gain = """                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">gain a deeper understanding of history</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">hiểu sâu hơn về lịch sử</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('gain a deeper understanding of history')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>
                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">gain a deeper understanding of science</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">hiểu sâu hơn về khoa học</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('gain a deeper understanding of science')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>
                            <div style="background: var(--bg-card); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0284c7; font-weight: 800;">gain a deeper understanding of art</strong>
                                    <div style="color: var(--text-muted); margin-top: 0.4rem; font-size: 0.95rem;">hiểu sâu hơn về nghệ thuật</div>
                                </div>
                                <button class="icon-btn" style="background: var(--bg-body); border: 1px solid var(--border); margin-left: 10px; flex-shrink: 0;" onclick="speakText('gain a deeper understanding of art')" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            </div>"""

def replace_fuzzy(src, target, repl):
    # normalize spaces for matching
    pattern = re.escape(target).replace(r'\ ', r'\s+')
    m = re.search(pattern, src)
    if m:
        print(f"Matched and replaced: {target[:40]}...")
        return src[:m.start()] + repl + src[m.end():]
    else:
        print(f"WARNING: Target not found: {target[:40]}")
        return src

html = replace_fuzzy(html, old_relax, new_relax)
html = replace_fuzzy(html, old_knowledge, new_knowledge)
html = replace_fuzzy(html, old_study, new_study)
html = replace_fuzzy(html, old_gain, new_gain)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html updated!")

# Also update script.js vocab times/transports to split slashes
with open(script_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace after school / work
js = js.replace(
    '{"en": "after school / work", "vn": "sau giờ học / làm"}',
    '{"en": "after school", "vn": "sau giờ học"},\n                    {"en": "after work", "vn": "sau giờ làm"}'
)

# Replace by car / taxi
js = js.replace(
    '{"en": "by car / taxi", "vn": "bằng ô tô / taxi"}',
    '{"en": "by car", "vn": "bằng ô tô"},\n                        {"en": "by taxi", "vn": "bằng taxi"}'
)

with open(script_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("script.js updated!")
