package com.crossword.app.ui.game

import com.crossword.app.domain.model.Cell
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class GameCellAnswerDisplayTest {
    @Test
    fun displaysNothingWhenCellInputAndAnswersAreHidden() {
        val cell = Cell(row = 0, col = 0, solutionChar = 'A', char = 'Z')

        val display = GameCellAnswerDisplay.displayChar(
            cell = cell,
            showAnswer = false,
            showCellInput = false
        )

        assertNull(display)
    }

    @Test
    fun displaysUserInputWhenInputModeIsVisibleAndAnswerIsHidden() {
        val cell = Cell(row = 0, col = 0, solutionChar = 'A', char = 'Z')

        val display = GameCellAnswerDisplay.displayChar(
            cell = cell,
            showAnswer = false,
            showCellInput = true
        )

        assertEquals('Z', display)
    }

    @Test
    fun answerDisplayOverridesUserInputInTheCell() {
        val cell = Cell(row = 0, col = 0, solutionChar = 'A', char = 'Z')

        val display = GameCellAnswerDisplay.displayChar(
            cell = cell,
            showAnswer = true,
            showCellInput = true
        )

        assertEquals('A', display)
    }

    @Test
    fun blockedCellsNeverDisplayAnswers() {
        val cell = Cell(row = 0, col = 0, solutionChar = 'A', isBlocked = true)

        val display = GameCellAnswerDisplay.displayChar(
            cell = cell,
            showAnswer = true,
            showCellInput = true
        )

        assertNull(display)
    }
}
