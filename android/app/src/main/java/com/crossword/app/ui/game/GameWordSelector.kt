package com.crossword.app.ui.game

import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement

object GameWordSelector {
    fun selectWord(
        crossword: Crossword,
        row: Int,
        col: Int,
        preferredDirection: Direction
    ): WordPlacement? {
        val wordsAtCell = crossword.getWordsAt(row, col)
        return wordsAtCell.firstOrNull { it.direction == preferredDirection }
            ?: wordsAtCell.firstOrNull()
    }
}
