package com.crossword.app.ui.game

import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GameWordRevealTest {
    @Test
    fun doesNotRevealSelectedWordUntilItsAnswerIsRequested() {
        val word = placement(id = 7)

        assertFalse(GameWordReveal.isRevealed(word, revealedWordIds = emptySet()))
    }

    @Test
    fun revealsSelectedWordWhenRequestedWordMatchesCurrentWord() {
        val word = placement(id = 7)

        assertTrue(GameWordReveal.isRevealed(word, revealedWordIds = setOf(7)))
    }

    @Test
    fun keepsWordRevealedWhenAnotherWordIsAlsoRevealed() {
        val word = placement(id = 7)

        assertTrue(GameWordReveal.isRevealed(word, revealedWordIds = setOf(7, 8)))
    }

    @Test
    fun doesNotRevealWordWhenOnlyOtherWordsWereRevealed() {
        val word = placement(id = 7)

        assertFalse(GameWordReveal.isRevealed(word, revealedWordIds = setOf(8)))
    }

    private fun placement(id: Int): WordPlacement {
        return WordPlacement(
            id = id,
            word = "OCEAN",
            clue = "Large body of water",
            row = 0,
            col = 0,
            direction = Direction.HORIZONTAL,
            number = 1,
            displayLabel = "1"
        )
    }
}
