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
    val inputMode: InputMode = InputMode.LETTERS,
    val candidateChars: List<Char> = emptyList()
)
