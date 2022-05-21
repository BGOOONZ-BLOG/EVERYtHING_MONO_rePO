import React from 'react'

export const Instagram = ({
	width = '12',
	height = '14',
	color = '#fff',
	className = '',
}) => (
	<svg
		className={className}
		width={width}
		height={height}
		viewBox="0 0 14 14"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fill={color}
			d="M8 7q0-.828-.586-1.414T6 5t-1.414.586T4 7t.586 1.414T6 9t1.414-.586T8 7zm1.078 0q0 1.281-.898 2.18T6 10.078 3.82 9.18 2.922 7t.898-2.18T6 3.922t2.18.898T9.078 7zm.844-3.203q0 .297-.211.508t-.508.211-.508-.211-.211-.508.211-.508.508-.211.508.211.211.508zM6 2.078l-.598-.004q-.543-.004-.824 0t-.754.023-.805.078-.559.145q-.391.156-.688.453t-.453.688q-.086.227-.145.559t-.078.805-.023.754 0 .824.004.598-.004.598 0 .824.023.754.078.805.145.559q.156.391.453.688t.688.453q.227.086.559.145t.805.078.754.023.824 0T6 11.924t.598.004.824 0 .754-.023.805-.078.559-.145q.391-.156.688-.453t.453-.688q.086-.227.145-.559t.078-.805.023-.754 0-.824-.004-.598.004-.598 0-.824-.023-.754-.078-.805-.145-.559q-.156-.391-.453-.688T9.54 2.32q-.227-.086-.559-.145t-.805-.078-.754-.023-.824 0T6 2.078zM12 7q0 1.789-.039 2.477-.078 1.625-.969 2.516t-2.516.969q-.688.039-2.477.039t-2.477-.039q-1.625-.078-2.516-.969T.037 9.477Q-.002 8.789-.002 7t.039-2.477q.078-1.625.969-2.516t2.516-.969Q4.21.999 5.999.999t2.477.039q1.625.078 2.516.969t.969 2.516Q12 5.211 12 7z"
		/>
	</svg>
)
