package com.crossword.app.ui.wordbank

import com.crossword.app.data.model.WordEntry
import com.crossword.app.domain.repository.WordRepository

/**
 * 词库来源类型
 */
sealed class WordSource {
    data class Assets(val filename: String) : WordSource()
    data class File(val uri: String) : WordSource()
    data class DirectInput(val words: List<WordEntry>) : WordSource()
}

/**
 * 词库状态
 */
data class WordBankState(
    val currentSource: WordSource = WordSource.Assets("wordlists/python_xword.txt"),
    val currentWordCount: Int = 0,
    val customWords: List<WordEntry> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

/**
 * 词库操作
 */
sealed class WordBankAction {
    data class ImportFromFile(val uri: String) : WordBankAction()
    data class ImportFromText(val text: String) : WordBankAction()
    object UseDefault : WordBankAction()
    object UseCustom : WordBankAction()
    object ClearCustom : WordBankAction()
}
