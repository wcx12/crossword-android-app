package com.crossword.app.ui.game

import com.crossword.app.domain.model.WordPlacement

data class HintActionState(
    val label: String,
    val enabled: Boolean,
    val selected: Boolean = false,
    val dimWhenDisabled: Boolean = true
)

data class HintControlState(
    val wordAnswer: HintActionState,
    val allAnswers: HintActionState
) {
    companion object {
        fun from(
            playMode: GamePlayMode,
            currentWord: WordPlacement?,
            isWordRevealed: Boolean,
            showSolution: Boolean
        ): HintControlState {
            return HintControlState(
                wordAnswer = HintActionState(
                    label = "本词答案",
                    enabled = playMode == GamePlayMode.REVEAL_WORD &&
                        currentWord != null &&
                        !showSolution &&
                        !isWordRevealed,
                    dimWhenDisabled = false
                ),
                allAnswers = HintActionState(
                    label = "全部答案",
                    enabled = true,
                    selected = showSolution
                )
            )
        }
    }
}
