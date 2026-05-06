package com.crossword.app.ui.game

object DirectionButtonLabel {
    fun text(label: String, isSelected: Boolean): String {
        return if (isSelected) "[$label]" else label
    }
}
