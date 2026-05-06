package com.crossword.app.data.model

data class WordListInfo(
    val id: String,
    val name: String,
    val assetPath: String?,
    val wordCount: Int,
    val isSystem: Boolean,
    val language: Language
)
