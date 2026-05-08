package com.crossword.app.ui.game

import com.crossword.app.data.local.WordListCatalog
import com.crossword.app.data.model.WordListInfo
import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement

enum class InputMode {
    LETTERS,
    CANDIDATE_CHARS
}

enum class GamePlayMode(val storageValue: String) {
    REVEAL_WORD("reveal_word"),
    FILL_WORD("fill_word");

    companion object {
        fun fromStorageValue(value: String?): GamePlayMode {
            return entries.firstOrNull { it.storageValue == value } ?: REVEAL_WORD
        }
    }
}

enum class WordSelectionMode(val storageValue: String) {
    DIRECTION_FIRST("direction_first"),
    AUTO_MATCH("auto_match");

    companion object {
        fun fromStorageValue(value: String?): WordSelectionMode {
            return entries.firstOrNull { it.storageValue == value } ?: DIRECTION_FIRST
        }
    }
}

data class GameState(
    val crossword: Crossword? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val selectedCell: Pair<Int, Int>? = null,
    val currentDirection: Direction = Direction.HORIZONTAL,
    val currentWord: WordPlacement? = null,
    val currentWords: List<WordPlacement> = emptyList(),
    val showSolution: Boolean = false,
    val isSolved: Boolean = false,
    val showSolvedDialog: Boolean = false,
    val wordLists: List<WordListInfo> = WordListCatalog.systemLists,
    val currentWordListId: String = WordListCatalog.DEFAULT_WORD_LIST_ID,
    val currentWordListName: String = "",
    val gridRows: Int = 13,
    val gridCols: Int = 13,
    val playMode: GamePlayMode = GamePlayMode.REVEAL_WORD,
    val wordSelectionMode: WordSelectionMode = WordSelectionMode.DIRECTION_FIRST,
    val showClues: Boolean = false,
    val highlightSelectedWord: Boolean = false,
    val revealedWordIds: Set<Int> = emptySet(),
    val inputMode: InputMode = InputMode.LETTERS,
    val candidateChars: List<Char> = emptyList()
)
