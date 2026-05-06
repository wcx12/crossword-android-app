package com.crossword.app.ui.game

data class GameSettingsDraft(
    val wordListId: String,
    val rows: Int,
    val cols: Int
) {
    fun withWordList(id: String): GameSettingsDraft {
        return copy(wordListId = id)
    }

    fun withGridSize(rows: Int, cols: Int): GameSettingsDraft {
        return copy(rows = rows, cols = cols)
    }

    fun isDifferentFrom(state: GameState): Boolean {
        return wordListId != state.currentWordListId ||
            rows != state.gridRows ||
            cols != state.gridCols
    }

    companion object {
        fun from(state: GameState): GameSettingsDraft {
            return GameSettingsDraft(
                wordListId = state.currentWordListId,
                rows = state.gridRows,
                cols = state.gridCols
            )
        }
    }
}
