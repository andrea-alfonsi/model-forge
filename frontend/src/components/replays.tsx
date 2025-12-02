import { ActionCard } from '@/components/action-card'

const highlightedExamples = [
    { values: [0.9, 0.1, 0.8, 0.2], label: 'Exmaple 1'},
    { values: [0.8, 0.2, 0.9, 0.1], label: 'Exmaple 2'},
    { values: [0.1, 0.9, 0.2, 0.8], label: 'Exmaple 3'},
    { values: [0.2, 0.8, 0.1, 0.9], label: 'Exmaple 4'},
]

export const HighlightedExamples = () => {
    return (
        <div className="w-full">
            {
                highlightedExamples.map((example, index) => (
                    <ActionCard action='Load' className='my-2' key={index}>
                        <div className="flex items-baseline space-x-2 truncate">{ example.label }</div>
                    </ActionCard>
                ))
            }
        </div>
    )
}
