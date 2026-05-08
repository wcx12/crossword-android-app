package com.crossword.app.ui.game

enum class CellBackgroundTone {
    Empty,
    Blocked,
    Highlight,
    RelatedHighlight
}

data class CellVisualStyle(
    val backgroundTone: CellBackgroundTone,
    val usesDarkFill: Boolean,
    val hasSelectionBorder: Boolean
) {
    companion object {
        fun forCell(
            isBlocked: Boolean,
            isSelected: Boolean,
            isInCurrentWord: Boolean,
            isInRelatedWord: Boolean
        ): CellVisualStyle {
            val backgroundTone = when {
                isBlocked -> CellBackgroundTone.Blocked
                isInCurrentWord -> CellBackgroundTone.Highlight
                isInRelatedWord -> CellBackgroundTone.RelatedHighlight
                else -> CellBackgroundTone.Empty
            }
            return CellVisualStyle(
                backgroundTone = backgroundTone,
                usesDarkFill = backgroundTone == CellBackgroundTone.Blocked,
                hasSelectionBorder = isSelected && !isBlocked
            )
        }
    }
}
