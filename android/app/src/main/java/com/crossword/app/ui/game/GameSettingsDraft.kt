package com.crossword.app.ui.game

data class GameSettingsDraft(
    val wordListId: String,
    val rows: Int,
    val cols: Int,
    val playMode: GamePlayMode,
    val showClues: Boolean,
    val highlightSelectedWord: Boolean
) {
    fun withWordList(id: String): GameSettingsDraft {
        return copy(wordListId = id)
    }

    fun withGridSize(rows: Int, cols: Int): GameSettingsDraft {
        return copy(rows = rows, cols = cols)
    }

    fun withPlayMode(playMode: GamePlayMode): GameSettingsDraft {
        return copy(playMode = playMode)
    }

    fun withShowClues(showClues: Boolean): GameSettingsDraft {
        return copy(showClues = showClues)
    }

    fun withHighlightSelectedWord(highlightSelectedWord: Boolean): GameSettingsDraft {
        return copy(highlightSelectedWord = highlightSelectedWord)
    }

    fun isDifferentFrom(state: GameState): Boolean {
        return wordListId != state.currentWordListId ||
            rows != state.gridRows ||
            cols != state.gridCols ||
            playMode != state.playMode ||
            showClues != state.showClues ||
            highlightSelectedWord != state.highlightSelectedWord
    }

    companion object {
        fun from(state: GameState): GameSettingsDraft {
            return GameSettingsDraft(
                wordListId = state.currentWordListId,
                rows = state.gridRows,
                cols = state.gridCols,
                playMode = state.playMode,
                showClues = state.showClues,
                highlightSelectedWord = state.highlightSelectedWord
            )
        }
    }
}
