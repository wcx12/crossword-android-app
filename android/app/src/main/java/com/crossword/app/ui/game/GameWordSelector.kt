package com.crossword.app.ui.game

import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement

object GameWordSelector {
    fun selectWord(
        crossword: Crossword,
        row: Int,
        col: Int,
        preferredDirection: Direction,
        selectionMode: WordSelectionMode
    ): WordPlacement? {
        val wordsAtCell = crossword.getWordsAt(row, col)
        val preferredWord = wordsAtCell.firstOrNull { it.direction == preferredDirection }
        return when (selectionMode) {
            WordSelectionMode.DIRECTION_FIRST -> preferredWord
            WordSelectionMode.AUTO_MATCH -> preferredWord ?: wordsAtCell.firstOrNull()
        }
    }
}
