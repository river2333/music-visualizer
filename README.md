# music-visualizer
音乐可视化工具

服务端：Node.js+Express+ejs
前端界面：HTML+CSS(CSS3)+JS
音频操作：webAudio
音频数据可视化：Canvas

浏览器通过Ajax从服务器端获取音频资源二进制arraybuffer数据，调用webAudioAPI解码数据为AudioBuffer数据播放，同时分析音频数据，调用用requestAnimationFrame()动画函数实时得到频域数据，用canvas可视化出来。
