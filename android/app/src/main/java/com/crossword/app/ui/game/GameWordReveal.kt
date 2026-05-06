package com.crossword.app.ui.game

import com.crossword.app.domain.model.WordPlacement

object GameWordReveal {
    fun isRevealed(currentWord: WordPlacement?, revealedWordIds: Set<Int>): Boolean {
        return currentWord != null && currentWord.id in revealedWordIds
    }
}
