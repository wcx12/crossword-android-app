package com.crossword.app.data.local

import android.content.Context
import com.crossword.app.data.model.Language
import com.crossword.app.data.model.WordEntry
import com.crossword.app.data.model.WordListInfo
import java.io.File

class WordListStorage(private val context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getWordLists(): List<WordListInfo> {
        return WordListCatalog.systemLists + getCustomLists()
    }

    fun getCurrentWordListId(): String {
        return prefs.getString(KEY_CURRENT_WORD_LIST_ID, WordListCatalog.DEFAULT_WORD_LIST_ID)
            ?: WordListCatalog.DEFAULT_WORD_LIST_ID
    }

    fun setCurrentWordListId(id: String) {
        prefs.edit()
            .putString(KEY_CURRENT_WORD_LIST_ID, id)
            .commitOrThrow("current word list")
    }

    fun getGridSize(): Pair<Int, Int> {
        return Pair(
            prefs.getInt(KEY_GRID_ROWS, DEFAULT_GRID_SIZE),
            prefs.getInt(KEY_GRID_COLS, DEFAULT_GRID_SIZE)
        )
    }

    fun setGridSize(rows: Int, cols: Int) {
        prefs.edit()
            .putInt(KEY_GRID_ROWS, rows)
            .putInt(KEY_GRID_COLS, cols)
            .commitOrThrow("grid size")
    }

    fun getPlayMode(): String {
        return prefs.getString(KEY_PLAY_MODE, DEFAULT_PLAY_MODE) ?: DEFAULT_PLAY_MODE
    }

    fun setPlayMode(playMode: String) {
        prefs.edit()
            .putString(KEY_PLAY_MODE, playMode)
            .commitOrThrow("play mode")
    }

    fun loadWords(info: WordListInfo): List<WordEntry> {
        return if (info.isSystem) {
            DefaultWordLoader.load(context, info.assetPath!!)
        } else {
            val file = customFile(info.id)
            if (file.exists()) WordFileParser.parse(file.readText()) else emptyList()
        }
    }

    fun addCustomList(name: String, entries: List<WordEntry>): WordListInfo {
        val id = "custom_${System.currentTimeMillis()}"
        val info = WordListInfo(
            id = id,
            name = name,
            assetPath = null,
            wordCount = entries.size,
            isSystem = false,
            language = if (entries.any { it.containsHan() }) Language.ZH else Language.EN
        )

        val directory = customDirectory()
        check(directory.exists() || directory.mkdirs()) {
            "Failed to create custom word list directory"
        }

        val file = customFile(id)
        file.writeText(CustomWordListCodec.encodeEntries(entries))
        try {
            saveCustomLists(getCustomLists() + info)
        } catch (error: IllegalStateException) {
            file.delete()
            throw error
        }
        return info
    }

    fun deleteCustomList(id: String) {
        saveCustomLists(getCustomLists().filterNot { it.id == id })

        if (getCurrentWordListId() == id) {
            setCurrentWordListId(WordListCatalog.DEFAULT_WORD_LIST_ID)
        }

        val file = customFile(id)
        check(!file.exists() || file.delete()) {
            "Failed to delete custom word list file"
        }
    }

    fun renameCustomList(id: String, newName: String) {
        val renamed = getCustomLists().map { info ->
            if (info.id == id) info.copy(name = newName) else info
        }
        saveCustomLists(renamed)
    }

    private fun getCustomLists(): List<WordListInfo> {
        val metadata = prefs.getString(KEY_CUSTOM_METADATA, null).orEmpty()
        return CustomWordListCodec.decodeMetadata(metadata)
    }

    private fun saveCustomLists(infos: List<WordListInfo>) {
        prefs.edit()
            .putString(KEY_CUSTOM_METADATA, CustomWordListCodec.encodeMetadata(infos))
            .commitOrThrow("custom word list metadata")
    }

    private fun customDirectory(): File {
        return File(context.filesDir, CUSTOM_DIR)
    }

    private fun customFile(id: String): File {
        return File(customDirectory(), "$id.txt")
    }

    private fun WordEntry.containsHan(): Boolean {
        return word.hasHan() || clue.hasHan()
    }

    private fun String.hasHan(): Boolean {
        return any { it in '\u4e00'..'\u9fff' }
    }

    private fun android.content.SharedPreferences.Editor.commitOrThrow(label: String) {
        check(commit()) { "Failed to persist $label" }
    }

    companion object {
        const val PREFS_NAME = "crossword_word_lists"
        const val KEY_CUSTOM_METADATA = "custom_metadata"
        const val KEY_CURRENT_WORD_LIST_ID = "current_word_list_id"
        const val KEY_GRID_ROWS = "grid_rows"
        const val KEY_GRID_COLS = "grid_cols"
        const val KEY_PLAY_MODE = "play_mode"
        const val CUSTOM_DIR = "custom_wordlists"

        private const val DEFAULT_GRID_SIZE = 13
        private const val DEFAULT_PLAY_MODE = "reveal_word"
    }
}
