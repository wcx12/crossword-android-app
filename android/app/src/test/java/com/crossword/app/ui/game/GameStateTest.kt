package com.crossword.app.ui.game

import com.crossword.app.data.local.WordListCatalog
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class GameStateTest {
    @Test
    fun defaultsExposeWordListAndGridSettings() {
        val state = GameState()

        assertEquals(WordListCatalog.systemLists, state.wordLists)
        assertEquals(WordListCatalog.DEFAULT_WORD_LIST_ID, state.currentWordListId)
        assertEquals("", state.currentWordListName)
        assertEquals(13, state.gridRows)
        assertEquals(13, state.gridCols)
        assertEquals(GamePlayMode.REVEAL_WORD, state.playMode)
        assertEquals(emptySet<Int>(), state.revealedWordIds)
        assertEquals(InputMode.LETTERS, state.inputMode)
        assertEquals(emptyList<Char>(), state.candidateChars)
        assertFalse(state.showSolvedDialog)
    }
}
