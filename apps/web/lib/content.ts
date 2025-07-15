export const defaultEditorContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "🖕 FuckNotion" }],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "当Notion让你想骂娘的时候，试试这个！" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "FuckNotion 是基于开源项目 ",
        },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://github.com/steven-tey/novel",
                target: "_blank",
              },
            },
          ],
          text: "Novel",
        },
        {
          type: "text",
          text: " 进行的魔改版本。如果你也曾经被Notion的各种奇葩限制搞得想摔电脑，那么恭喜你找到组织了！",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "🤔 为什么叫FuckNotion？" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "因为我们受够了Notion的：",
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "💸 " },
                { type: "text", marks: [{ type: "bold" }], text: "昂贵的订阅费用" },
                { type: "text", text: " - 想要点高级功能？先掏钱！" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "🐌 " },
                { type: "text", marks: [{ type: "bold" }], text: "龟速加载" },
                { type: "text", text: " - 打开个页面比煮泡面还慢" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "🔒 " },
                { type: "text", marks: [{ type: "bold" }], text: "数据绑架" },
                { type: "text", text: " - 想导出数据？呵呵，没那么容易" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "🎨 " },
                { type: "text", marks: [{ type: "bold" }], text: "千篇一律的界面" },
                { type: "text", text: " - 想个性化？做梦去吧" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "✨ FuckNotion的超能力" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "我们保留了Novel的所有优秀功能，并且添加了一些自己的特色：",
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "bold" }], text: "完全免费开源" },
                { type: "text", text: " - 不用担心突然要付费" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "bold" }], text: "本地优先" },
                { type: "text", text: " - 数据存在你自己的电脑上，不用担心服务商跑路" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "bold" }], text: "离线可用" },
                { type: "text", text: " - 断网也能愉快编辑" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "bold" }], text: "AI增强" },
                { type: "text", text: " - 支持多种AI模型，不限于OpenAI" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "bold" }], text: "高度可定制" },
                { type: "text", text: " - 想改啥就改啥，代码完全开源" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "🚀 快速上手" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "使用FuckNotion就像使用一个普通的编辑器一样简单，但功能却强大得多：",
        },
      ],
    },
    {
      type: "orderedList",
      attrs: { tight: true, start: 1 },
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "按 " },
                { type: "text", marks: [{ type: "code" }], text: "/" },
                { type: "text", text: " 调出命令菜单" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "输入 " },
                { type: "text", marks: [{ type: "code" }], text: "++" },
                { type: "text", text: " 激活AI自动补全" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "拖拽图片到编辑器中即可上传" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "支持Markdown语法" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "🧠 AI功能演示" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "试试在下面输入 ",
        },
        {
          type: "text",
          marks: [{ type: "code" }],
          text: "++",
        },
        {
          type: "text",
          text: " 然后写一些内容，看看AI如何帮你完成句子：",
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: null },
      content: [
        {
          type: "text",
          text: "// 例如：\n我认为Notion最大的问题是++",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "🎯 技术栈" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "FuckNotion基于现代化的技术栈构建：",
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://tiptap.dev/",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Tiptap",
                },
                { type: "text", text: " - 强大的富文本编辑器框架" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://nextjs.org/",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Next.js",
                },
                { type: "text", text: " - React全栈框架" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://tailwindcss.com/",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Tailwind CSS",
                },
                { type: "text", text: " - 实用优先的CSS框架" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://sdk.vercel.ai/docs",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Vercel AI SDK",
                },
                { type: "text", text: " - AI集成工具包" },
              ],
            },
          ],
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "🙏 致谢" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "FuckNotion的存在离不开以下开源项目的贡献：",
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "🌟 特别感谢 " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://github.com/steven-tey/novel",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Novel项目",
                },
                { type: "text", text: " 提供的优秀基础框架" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "感谢 " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://github.com/steven-tey",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Steven Tey",
                },
                { type: "text", text: " 和所有Novel贡献者的辛勤工作" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "感谢开源社区的无私奉献精神" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "📝 最后的话" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "如果你也对Notion的种种限制感到不爽，那就来试试FuckNotion吧！我们的目标很简单：",
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "italic" }],
              text: "让每个人都能拥有一个真正属于自己的、强大的、免费的笔记工具。",
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "现在就开始使用吧！点击上方的菜单按钮创建你的第一个页面，或者直接在这里开始编辑。",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "记住：",
        },
        {
          type: "text",
          marks: [{ type: "bold" }],
          text: " 你的数据，你做主！",
        },
      ],
    },
  ],
};
