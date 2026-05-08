package com.crossword.app.ui.game

import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HintControlStateTest {
    @Test
    fun keepsActionLabelsStableAcrossRevealStates() {
        val selectedWord = placement()
        val hidden = HintControlState.from(
            playMode = GamePlayMode.REVEAL_WORD,
            currentWord = selectedWord,
            isWordRevealed = false,
            showSolution = false
        )
        val allShown = HintControlState.from(
            playMode = GamePlayMode.REVEAL_WORD,
            currentWord = selectedWord,
            isWordRevealed = false,
            showSolution = true
        )

        assertEquals("本词答案", hidden.wordAnswer.label)
        assertEquals("全部答案", hidden.allAnswers.label)
        assertEquals(hidden.wordAnswer.label, allShown.wordAnswer.label)
        assertEquals(hidden.allAnswers.label, allShown.allAnswers.label)
    }

    @Test
    fun onlyChangesWordAnswerAvailabilityWhenSelectedWordCanBeRevealed() {
        val selectedWord = placement()

        assertTrue(
            HintControlState.from(
                playMode = GamePlayMode.REVEAL_WORD,
                currentWord = selectedWord,
                isWordRevealed = false,
                showSolution = false
            ).wordAnswer.enabled
        )
        assertFalse(
            HintControlState.from(
                playMode = GamePlayMode.REVEAL_WORD,
                currentWord = null,
                isWordRevealed = false,
                showSolution = false
            ).wordAnswer.enabled
        )
        assertFalse(
            HintControlState.from(
                playMode = GamePlayMode.REVEAL_WORD,
                currentWord = selectedWord,
                isWordRevealed = true,
                showSolution = false
            ).wordAnswer.enabled
        )
        assertFalse(
            HintControlState.from(
                playMode = GamePlayMode.FILL_WORD,
                currentWord = selectedWord,
                isWordRevealed = false,
                showSolution = false
            ).wordAnswer.enabled
        )
    }

    @Test
    fun marksAllAnswersSelectedWithoutChangingItsLabel() {
        val controls = HintControlState.from(
            playMode = GamePlayMode.REVEAL_WORD,
            currentWord = placement(),
            isWordRevealed = false,
            showSolution = true
        )

        assertEquals("全部答案", controls.allAnswers.label)
        assertTrue(controls.allAnswers.enabled)
        assertTrue(controls.allAnswers.selected)
    }

    private fun placement(): WordPlacement {
        return WordPlacement(
            id = 1,
            word = "TREE",
            clue = "Plant",
            row = 0,
            col = 0,
            direction = Direction.HORIZONTAL,
            number = 1,
            displayLabel = "1"
        )
    }
}
