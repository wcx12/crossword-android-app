package com.crossword.app.ui.wordbank

import com.crossword.app.data.local.WordListCatalog
import com.crossword.app.data.model.WordEntry
import com.crossword.app.data.model.WordListInfo

data class WordBankState(
    val wordLists: List<WordListInfo> = WordListCatalog.systemLists,
    val currentWordListId: String = WordListCatalog.DEFAULT_WORD_LIST_ID,
    val currentWordCount: Int = 0,
    val customWords: List<WordEntry> = emptyList(),
    val gridRows: Int = 13,
    val gridCols: Int = 13,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)
