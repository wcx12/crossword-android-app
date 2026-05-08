package com.crossword.app.ui.game

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.crossword.app.data.local.WordListCatalog
import com.crossword.app.data.local.WordListStorage
import com.crossword.app.data.model.WordEntry
import com.crossword.app.data.model.WordListInfo
import com.crossword.app.domain.model.Cell
import com.crossword.app.domain.model.Clue
import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement
import com.crossword.app.domain.usecase.CrosswordGenerator
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class GameViewModel(application: Application) : AndroidViewModel(application) {
    private val storage = WordListStorage(application)
    private val generationRequests = GameGenerationRequests()
    private val _state = MutableStateFlow(GameState())
    private var generationJob: Job? = null

    val state: StateFlow<GameState> = _state.asStateFlow()

    init {
        val gridSize = storage.getGridSize()
        startNewGame(
            wordListId = storage.getCurrentWordListId(),
            rows = gridSize.first,
            cols = gridSize.second,
            playMode = GamePlayMode.fromStorageValue(storage.getPlayMode()),
            showClues = storage.getShowClues(),
            highlightSelectedWord = storage.getHighlightSelectedWord(),
            wordSelectionMode = WordSelectionMode.fromStorageValue(storage.getWordSelectionMode())
        )
    }

    fun newGame(rows: Int = _state.value.gridRows, cols: Int = _state.value.gridCols) {
        startNewGame(
            wordListId = _state.value.currentWordListId,
            rows = rows,
            cols = cols,
            playMode = _state.value.playMode,
            showClues = _state.value.showClues,
            highlightSelectedWord = _state.value.highlightSelectedWord,
            wordSelectionMode = _state.value.wordSelectionMode
        )
    }

    fun selectWordList(id: String) {
        startNewGame(
            wordListId = id,
            rows = _state.value.gridRows,
            cols = _state.value.gridCols,
            playMode = _state.value.playMode,
            showClues = _state.value.showClues,
            highlightSelectedWord = _state.value.highlightSelectedWord,
            wordSelectionMode = _state.value.wordSelectionMode
        )
    }

    fun resizeGrid(rows: Int, cols: Int) {
        startNewGame(
            wordListId = _state.value.currentWordListId,
            rows = rows,
            cols = cols,
            playMode = _state.value.playMode,
            showClues = _state.value.showClues,
            highlightSelectedWord = _state.value.highlightSelectedWord,
            wordSelectionMode = _state.value.wordSelectionMode
        )
    }

    fun applySettings(
        wordListId: String,
        rows: Int,
        cols: Int,
        playMode: GamePlayMode,
        showClues: Boolean,
        highlightSelectedWord: Boolean,
        wordSelectionMode: WordSelectionMode
    ) {
        val safeRows = rows.coerceIn(MIN_GRID_SIZE, MAX_GRID_SIZE)
        val safeCols = cols.coerceIn(MIN_GRID_SIZE, MAX_GRID_SIZE)
        val needsNewGame = wordListId != _state.value.currentWordListId ||
            safeRows != _state.value.gridRows ||
            safeCols != _state.value.gridCols ||
            _state.value.crossword == null

        if (!needsNewGame) {
            storage.setPlayMode(playMode.storageValue)
            storage.setShowClues(showClues)
            storage.setHighlightSelectedWord(highlightSelectedWord)
            storage.setWordSelectionMode(wordSelectionMode.storageValue)
            _state.update {
                it.copy(
                    playMode = playMode,
                    showClues = showClues,
                    highlightSelectedWord = highlightSelectedWord,
                    wordSelectionMode = wordSelectionMode,
                    showSolution = false,
                    revealedWordIds = emptySet(),
                    showSolvedDialog = false
                )
            }
            return
        }

        startNewGame(
            wordListId = wordListId,
            rows = rows,
            cols = cols,
            playMode = playMode,
            showClues = showClues,
            highlightSelectedWord = highlightSelectedWord,
            wordSelectionMode = wordSelectionMode
        )
    }

    fun addCustomWordList(
        name: String,
        entries: List<WordEntry>,
        onCreated: (String) -> Unit = {}
    ) {
        if (entries.isEmpty()) return

        viewModelScope.launch(Dispatchers.IO) {
            val info = storage.addCustomList(name.ifBlank { "自定义词库" }, entries)
            val lists = storage.getWordLists()

            withContext(Dispatchers.Main) {
                _state.update { it.copy(wordLists = lists) }
                onCreated(info.id)
            }
        }
    }

    fun deleteCustomWordList(id: String) {
        viewModelScope.launch(Dispatchers.IO) {
            val deletingCurrent = id == _state.value.currentWordListId
            storage.deleteCustomList(id)

            if (deletingCurrent) {
                startNewGame(
                    wordListId = storage.getCurrentWordListId(),
                    rows = _state.value.gridRows,
                    cols = _state.value.gridCols,
                    playMode = _state.value.playMode,
                    showClues = _state.value.showClues,
                    highlightSelectedWord = _state.value.highlightSelectedWord,
                    wordSelectionMode = _state.value.wordSelectionMode
                )
            } else {
                refreshWordLists()
            }
        }
    }

    fun renameCustomWordList(id: String, newName: String) {
        val trimmed = newName.trim()
        if (trimmed.isEmpty()) return

        viewModelScope.launch(Dispatchers.IO) {
            storage.renameCustomList(id, trimmed)
            refreshWordLists()
        }
    }

    fun loadCustomPuzzle(
        rows: Int,
        cols: Int,
        grid: List<List<Cell>>,
        placements: List<WordPlacement>
    ) {
        val crossword = Crossword(
            rows = rows,
            cols = cols,
            grid = grid,
            placements = placements,
            clues = placements.map {
                Clue(
                    number = it.number,
                    word = it.word,
                    clue = it.clue,
                    direction = it.direction
                )
            }
        )

        val candidates = GameInputNormalizer.candidateChars(crossword)
        _state.update {
            it.copy(
                crossword = crossword,
                isLoading = false,
                errorMessage = null,
                selectedCell = null,
                currentWord = null,
                currentWords = emptyList(),
                showSolution = false,
                revealedWordIds = emptySet(),
                isSolved = false,
                showSolvedDialog = false,
                gridRows = rows.coerceIn(MIN_GRID_SIZE, MAX_GRID_SIZE),
                gridCols = cols.coerceIn(MIN_GRID_SIZE, MAX_GRID_SIZE),
                playMode = _state.value.playMode,
                showClues = _state.value.showClues,
                highlightSelectedWord = _state.value.highlightSelectedWord,
                wordSelectionMode = _state.value.wordSelectionMode,
                candidateChars = candidates,
                inputMode = GameInputNormalizer.inputModeFor(candidates)
            )
        }
    }

    fun selectCell(row: Int, col: Int) {
        val crossword = _state.value.crossword ?: return
        val cell = crossword.grid.getOrNull(row)?.getOrNull(col) ?: return

        if (cell.isBlocked) return

        val currentDir = _state.value.currentDirection
        val selectionMode = _state.value.wordSelectionMode
        val wordsAtCell = crossword.getWordsAt(row, col)
        val newWord = GameWordSelector.selectWord(
            crossword = crossword,
            row = row,
            col = col,
            preferredDirection = currentDir,
            selectionMode = selectionMode
        ) ?: return

        _state.update {
            it.copy(
                selectedCell = Pair(row, col),
                currentDirection = newWord.direction,
                currentWord = newWord,
                currentWords = wordsAtCell
            )
        }
    }

    fun toggleDirection() {
        val newDir = when (_state.value.currentDirection) {
            Direction.HORIZONTAL -> Direction.VERTICAL
            Direction.VERTICAL -> Direction.HORIZONTAL
        }
        setDirection(newDir)
    }

    fun setDirection(direction: Direction) {
        val selected = _state.value.selectedCell
        val crossword = _state.value.crossword

        if (selected != null && crossword != null) {
            val wordsAtCell = crossword.getWordsAt(selected.first, selected.second)
            val word = GameWordSelector.selectWord(
                crossword = crossword,
                row = selected.first,
                col = selected.second,
                preferredDirection = direction,
                selectionMode = _state.value.wordSelectionMode
            )
            _state.update {
                it.copy(
                    currentDirection = word?.direction ?: direction,
                    currentWord = word,
                    currentWords = if (word == null) emptyList() else wordsAtCell
                )
            }
        } else {
            _state.update { it.copy(currentDirection = direction) }
        }
    }

    fun inputLetter(letter: Char) {
        if (_state.value.playMode != GamePlayMode.FILL_WORD) return

        val selected = _state.value.selectedCell ?: return
        val crossword = _state.value.crossword ?: return
        val cell = crossword.grid.getOrNull(selected.first)?.getOrNull(selected.second) ?: return

        if (cell.isBlocked) return

        val newGrid = crossword.mutableCellCopy()
        newGrid[selected.first][selected.second] =
            newGrid[selected.first][selected.second].copy(
                char = GameInputNormalizer.normalizeInput(letter)
            )
        val newCrossword = crossword.copy(grid = newGrid)

        _state.update { it.copy(crossword = newCrossword) }
        moveToNextCell()
        checkSolved()
    }

    fun deleteLetter() {
        if (_state.value.playMode != GamePlayMode.FILL_WORD) return

        val selected = _state.value.selectedCell ?: return
        val crossword = _state.value.crossword ?: return
        val target = GameDeletionNavigator.findTarget(
            crossword = crossword,
            selectedCell = selected,
            currentWord = _state.value.currentWord
        ) ?: return
        val cell = crossword.grid.getOrNull(target.first)?.getOrNull(target.second) ?: return

        if (cell.isBlocked) return

        val newGrid = crossword.mutableCellCopy()
        newGrid[target.first][target.second] =
            newGrid[target.first][target.second].copy(char = null)
        val newCrossword = crossword.copy(grid = newGrid)
        val wordsAtTarget = newCrossword.getWordsAt(target.first, target.second)
        val currentWord = wordsAtTarget.firstOrNull { it.direction == _state.value.currentDirection }
            ?: wordsAtTarget.firstOrNull()

        _state.update {
            it.copy(
                crossword = newCrossword,
                selectedCell = target,
                currentWord = currentWord,
                currentWords = wordsAtTarget
            )
        }
    }

    fun clearWord() {
        if (_state.value.playMode != GamePlayMode.FILL_WORD) return

        val word = _state.value.currentWord ?: return
        val crossword = _state.value.crossword ?: return
        val newGrid = crossword.mutableCellCopy()

        for ((row, col) in word.getCells()) {
            newGrid[row][col] = newGrid[row][col].copy(char = null)
        }

        _state.update { it.copy(crossword = crossword.copy(grid = newGrid)) }
    }

    fun showSolution() {
        val currentWordId = _state.value.currentWord?.id ?: return
        _state.update { it.copy(revealedWordIds = it.revealedWordIds + currentWordId) }
    }

    fun showAllSolutions() {
        _state.update { it.copy(showSolution = true) }
    }

    fun hideSolution() {
        _state.update { it.copy(showSolution = false) }
    }

    fun dismissSolvedDialog() {
        _state.update { it.copy(showSolvedDialog = false) }
    }

    private fun startNewGame(
        wordListId: String,
        rows: Int,
        cols: Int,
        playMode: GamePlayMode = _state.value.playMode,
        showClues: Boolean = _state.value.showClues,
        highlightSelectedWord: Boolean = _state.value.highlightSelectedWord,
        wordSelectionMode: WordSelectionMode = _state.value.wordSelectionMode
    ) {
        val requestId = generationRequests.next()
        val safeRows = rows.coerceIn(MIN_GRID_SIZE, MAX_GRID_SIZE)
        val safeCols = cols.coerceIn(MIN_GRID_SIZE, MAX_GRID_SIZE)

        generationJob?.cancel()

        generationRequests.runIfCurrent(requestId) {
            _state.update {
                it.copy(
                    isLoading = true,
                    errorMessage = null,
                    gridRows = safeRows,
                    gridCols = safeCols,
                    playMode = playMode,
                    showClues = showClues,
                    highlightSelectedWord = highlightSelectedWord,
                    wordSelectionMode = wordSelectionMode,
                    revealedWordIds = emptySet(),
                    showSolvedDialog = false
                )
            }
        }

        generationJob = viewModelScope.launch(Dispatchers.IO) {
            try {
                val lists = storage.getWordLists()
                val selectedInfo = resolveWordList(lists, wordListId)
                val words = storage.loadWords(selectedInfo)

                val persisted = generationRequests.runIfCurrent(requestId) {
                    storage.setCurrentWordListId(selectedInfo.id)
                    storage.setGridSize(safeRows, safeCols)
                    storage.setPlayMode(playMode.storageValue)
                    storage.setShowClues(showClues)
                    storage.setHighlightSelectedWord(highlightSelectedWord)
                    storage.setWordSelectionMode(wordSelectionMode.storageValue)
                }
                if (!persisted) return@launch

                val crossword = withContext(Dispatchers.Default) {
                    CrosswordGenerator(rows = safeRows, cols = safeCols)
                        .generate(words, timeLimit = 3f)
                }

                if (!generationRequests.isCurrent(requestId)) return@launch

                withContext(Dispatchers.Main) {
                    generationRequests.runIfCurrent(requestId) {
                        applyGeneratedGame(
                            crossword = crossword,
                            wordLists = lists,
                            selectedInfo = selectedInfo,
                            rows = safeRows,
                            cols = safeCols,
                            playMode = playMode,
                            showClues = showClues,
                            highlightSelectedWord = highlightSelectedWord,
                            wordSelectionMode = wordSelectionMode,
                            wordCount = words.size
                        )
                    }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                if (!generationRequests.isCurrent(requestId)) return@launch

                withContext(Dispatchers.Main) {
                    generationRequests.runIfCurrent(requestId) {
                        _state.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = "生成失败: ${e.message}"
                            )
                        }
                    }
                }
            }
        }
    }

    private fun applyGeneratedGame(
        crossword: Crossword?,
        wordLists: List<WordListInfo>,
        selectedInfo: WordListInfo,
        rows: Int,
        cols: Int,
        playMode: GamePlayMode,
        showClues: Boolean,
        highlightSelectedWord: Boolean,
        wordSelectionMode: WordSelectionMode,
        wordCount: Int
    ) {
        if (crossword == null) {
            _state.update {
                it.copy(
                    isLoading = false,
                    wordLists = wordLists,
                    currentWordListId = selectedInfo.id,
                    currentWordListName = selectedInfo.name,
                    gridRows = rows,
                    gridCols = cols,
                    playMode = playMode,
                    showClues = showClues,
                    highlightSelectedWord = highlightSelectedWord,
                    wordSelectionMode = wordSelectionMode,
                    revealedWordIds = emptySet(),
                    errorMessage = "无法生成谜题，请尝试更多词条或更大的网格（当前词条: $wordCount）"
                )
            }
            return
        }

        val candidates = GameInputNormalizer.candidateChars(crossword)
        _state.update {
            it.copy(
                crossword = crossword,
                isLoading = false,
                errorMessage = null,
                isSolved = false,
                showSolvedDialog = false,
                showSolution = false,
                revealedWordIds = emptySet(),
                selectedCell = null,
                currentWord = null,
                currentWords = emptyList(),
                wordLists = wordLists,
                currentWordListId = selectedInfo.id,
                currentWordListName = selectedInfo.name,
                gridRows = rows,
                gridCols = cols,
                playMode = playMode,
                showClues = showClues,
                highlightSelectedWord = highlightSelectedWord,
                wordSelectionMode = wordSelectionMode,
                candidateChars = candidates,
                inputMode = GameInputNormalizer.inputModeFor(candidates)
            )
        }
    }

    private suspend fun refreshWordLists() {
        val lists = storage.getWordLists()
        val current = resolveWordList(lists, storage.getCurrentWordListId())

        withContext(Dispatchers.Main) {
            _state.update {
                it.copy(
                    wordLists = lists,
                    currentWordListId = current.id,
                    currentWordListName = current.name
                )
            }
        }
    }

    private fun resolveWordList(lists: List<WordListInfo>, id: String): WordListInfo {
        return lists.find { it.id == id }
            ?: WordListCatalog.findSystemList(WordListCatalog.DEFAULT_WORD_LIST_ID)
            ?: lists.first()
    }

    private fun moveToNextCell() {
        val selected = _state.value.selectedCell ?: return
        val crossword = _state.value.crossword ?: return
        val direction = _state.value.currentDirection
        val (row, col) = selected
        val (dr, dc) = when (direction) {
            Direction.HORIZONTAL -> Pair(0, 1)
            Direction.VERTICAL -> Pair(1, 0)
        }

        var newRow = row + dr
        var newCol = col + dc

        while (newRow in 0 until crossword.rows && newCol in 0 until crossword.cols) {
            val cell = crossword.grid[newRow][newCol]
            if (!cell.isBlocked) {
                val wordsAtCell = crossword.getWordsAt(newRow, newCol)
                val word = wordsAtCell.firstOrNull { it.direction == direction }
                    ?: wordsAtCell.firstOrNull()
                _state.update {
                    it.copy(
                        selectedCell = Pair(newRow, newCol),
                        currentWord = word,
                        currentWords = wordsAtCell
                    )
                }
                return
            }
            newRow += dr
            newCol += dc
        }
    }

    private fun checkSolved() {
        val crossword = _state.value.crossword ?: return

        if (crossword.isSolved()) {
            _state.update {
                it.copy(
                    isSolved = true,
                    showSolvedDialog = true
                )
            }
        }
    }

    private fun Crossword.mutableCellCopy(): MutableList<MutableList<Cell>> {
        return grid.map { row ->
            row.map { it.copy() }.toMutableList()
        }.toMutableList()
    }

    companion object {
        private const val MIN_GRID_SIZE = 5
        private const val MAX_GRID_SIZE = 25
    }
}
