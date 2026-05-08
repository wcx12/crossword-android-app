package com.crossword.app.ui.game

import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class GameClueDisplayTest {
    @Test
    fun hidesSelectedWordClueWhenSettingIsDisabled() {
        val word = placement(clue = "A programming language")

        assertNull(GameClueDisplay.selectedClueText(word, showClues = false))
    }

    @Test
    fun showsSelectedWordClueWhenSettingIsEnabled() {
        val word = placement(clue = "A programming language")

        assertEquals(
            "A programming language",
            GameClueDisplay.selectedClueText(word, showClues = true)
        )
    }

    @Test
    fun fallsBackWhenVisibleClueIsBlank() {
        val word = placement(clue = "")

        assertEquals("暂无提示", GameClueDisplay.selectedClueText(word, showClues = true))
    }

    private fun placement(clue: String): WordPlacement {
        return WordPlacement(
            id = 1,
            word = "KOTLIN",
            clue = clue,
            row = 0,
            col = 0,
            direction = Direction.HORIZONTAL,
            number = 1,
            displayLabel = "1"
        )
    }
}
