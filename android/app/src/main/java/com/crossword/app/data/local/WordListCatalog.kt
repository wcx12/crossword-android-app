package com.crossword.app.data.local

import com.crossword.app.data.model.Language
import com.crossword.app.data.model.WordListInfo

object WordListCatalog {
    const val DEFAULT_WORD_LIST_ID = "python_xword"

    val systemLists: List<WordListInfo> = listOf(
        WordListInfo(
            id = "python_xword",
            name = "Monty Python 主题",
            assetPath = "wordlists/python_xword.txt",
            wordCount = 31,
            isSystem = true,
            language = Language.EN
        ),
        WordListInfo(
            id = "general_knowledge",
            name = "常识词汇",
            assetPath = "wordlists/general_knowledge.txt",
            wordCount = 68,
            isSystem = true,
            language = Language.EN
        ),
        WordListInfo(
            id = "chinese_idioms",
            name = "中文成语",
            assetPath = "wordlists/chinese_idioms_core.txt",
            wordCount = 5000,
            isSystem = true,
            language = Language.ZH
        )
    )

    fun findSystemList(id: String): WordListInfo? {
        return systemLists.find { it.id == id }
    }
}
