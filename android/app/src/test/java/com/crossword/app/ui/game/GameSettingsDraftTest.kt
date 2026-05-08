package com.crossword.app.ui.game

import com.crossword.app.data.local.WordListCatalog
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GameSettingsDraftTest {
    @Test
    fun fromStateCopiesCurrentConfiguration() {
        val state = GameState(
            currentWordListId = WordListCatalog.DEFAULT_WORD_LIST_ID,
            gridRows = 12,
            gridCols = 14,
            wordSelectionMode = WordSelectionMode.AUTO_MATCH,
            showClues = true,
            highlightSelectedWord = true
        )

        val draft = GameSettingsDraft.from(state)

        assertEquals(WordListCatalog.DEFAULT_WORD_LIST_ID, draft.wordListId)
        assertEquals(12, draft.rows)
        assertEquals(14, draft.cols)
        assertEquals(GamePlayMode.REVEAL_WORD, draft.playMode)
        assertEquals(WordSelectionMode.AUTO_MATCH, draft.wordSelectionMode)
        assertTrue(draft.showClues)
        assertTrue(draft.highlightSelectedWord)
        assertFalse(draft.isDifferentFrom(state))
    }

    @Test
    fun changingDraftDoesNotChangeAppliedStateUntilSubmitted() {
        val state = GameState(gridRows = 13, gridCols = 13)
        val draft = GameSettingsDraft.from(state).withGridSize(rows = 16, cols = 15)

        assertEquals(13, state.gridRows)
        assertEquals(13, state.gridCols)
        assertEquals(16, draft.rows)
        assertEquals(15, draft.cols)
        assertTrue(draft.isDifferentFrom(state))
    }

    @Test
    fun changingPlayModeMakesDraftDifferentFromAppliedState() {
        val state = GameState(playMode = GamePlayMode.REVEAL_WORD)
        val draft = GameSettingsDraft.from(state).withPlayMode(GamePlayMode.FILL_WORD)

        assertEquals(GamePlayMode.FILL_WORD, draft.playMode)
        assertTrue(draft.isDifferentFrom(state))
    }

    @Test
    fun changingWordSelectionModeMakesDraftDifferentFromAppliedState() {
        val state = GameState(wordSelectionMode = WordSelectionMode.DIRECTION_FIRST)
        val draft = GameSettingsDraft.from(state).withWordSelectionMode(WordSelectionMode.AUTO_MATCH)

        assertEquals(WordSelectionMode.AUTO_MATCH, draft.wordSelectionMode)
        assertTrue(draft.isDifferentFrom(state))
    }

    @Test
    fun changingClueVisibilityMakesDraftDifferentFromAppliedState() {
        val state = GameState(showClues = false)
        val draft = GameSettingsDraft.from(state).withShowClues(true)

        assertTrue(draft.showClues)
        assertTrue(draft.isDifferentFrom(state))
    }

    @Test
    fun changingSelectedWordHighlightMakesDraftDifferentFromAppliedState() {
        val state = GameState(highlightSelectedWord = false)
        val draft = GameSettingsDraft.from(state).withHighlightSelectedWord(true)

        assertTrue(draft.highlightSelectedWord)
        assertTrue(draft.isDifferentFrom(state))
    }
}
