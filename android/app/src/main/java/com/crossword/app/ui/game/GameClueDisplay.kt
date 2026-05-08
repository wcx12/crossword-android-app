package com.crossword.app.ui.game

import com.crossword.app.domain.model.WordPlacement

object GameClueDisplay {
    fun selectedClueText(currentWord: WordPlacement?, showClues: Boolean): String? {
        if (currentWord == null || !showClues) return null
        return currentWord.clue.ifEmpty { "暂无提示" }
    }
}
