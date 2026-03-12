import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import { PiSparkleFill } from 'react-icons/pi';
import { MdClose, MdDoneAll, MdErrorOutline } from 'react-icons/md';
import { THEME_COLORS } from '../../../constants/themeColors';

const BackgroundTaskTracker = ({ tasks = [], onCloseAll, onDismissTask, onOpenTask }) => {
    const [expanded, setExpanded] = useState(false);
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        if (!expanded) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [expanded]);

    if (tasks.length === 0) return null;

    const runningCount = tasks.filter(t => t.status === 'running').length;
    const doneCount    = tasks.filter(t => t.status === 'done').length;
    const errorCount   = tasks.filter(t => t.status === 'error').length;

    const badgeColor = runningCount > 0 ? '#f59e0b'
        : errorCount > 0 ? '#e53935'
        : '#4caf50';

    return (
        <>
            <style>{`
                @keyframes btt-enter {
                    from { opacity: 0; transform: scale(0.92) translateY(6px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes btt-panel-enter {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes btt-pulse {
                    0%   { transform: scale(1);   opacity: 0.5; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes btt-pulse2 {
                    0%   { transform: scale(1);   opacity: 0.3; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes btt-breathe {
                    0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10); }
                    50%      { box-shadow: 0 8px 32px rgba(42,104,175,0.40), 0 4px 16px rgba(0,0,0,0.13); }
                }
                @keyframes btt-blink {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.2; }
                }
                @keyframes btt-sparkle {
                    0%,100% { transform: rotate(0deg) scale(1); }
                    25%     { transform: rotate(8deg) scale(1.15); }
                    75%     { transform: rotate(-6deg) scale(1.1); }
                }
                @keyframes btt-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }

                .btt-bubble        { animation: btt-enter 0.22s cubic-bezier(0.22,1,0.36,1) both; box-shadow: 0 4px 20px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10); }
                .btt-bubble-active { animation: btt-enter 0.22s cubic-bezier(0.22,1,0.36,1) both, btt-breathe 2.5s ease-in-out 0.22s infinite; }
                .btt-pulse-ring    { animation: btt-pulse  2.2s ease-out infinite; }
                .btt-pulse-ring2   { animation: btt-pulse2 2.2s ease-out 0.65s infinite; }
                .btt-status-dot    { animation: btt-blink 1.6s ease-in-out infinite; }
                .btt-panel         { animation: btt-panel-enter 0.18s cubic-bezier(0.22,1,0.36,1) both; }
                .btt-sparkle-icon  { animation: btt-sparkle 2.4s ease-in-out infinite; display: inline-block; }

                .btt-shimmer-bar::after {
                    content: '';
                    display: block;
                    height: 100%;
                    width: 45%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
                    background-size: 200% 100%;
                    animation: btt-shimmer 1.6s linear infinite;
                }

                .btt-task-row { transition: background 0.15s ease; }
                .btt-task-row.is-done { cursor: pointer; }
                .btt-task-row.is-done:hover { background-color: #e8f1fc !important; }

                .btt-dismiss-btn {
                    opacity: 0 !important;
                    transition: opacity 0.15s ease !important;
                }
                .btt-task-row:hover .btt-dismiss-btn { opacity: 1 !important; }

                .btt-open-hint {
                    font-size: 11px;
                    font-weight: 600;
                    color: #2a68af;
                    white-space: nowrap;
                    opacity: 0;
                    transition: opacity 0.15s ease;
                }
                .btt-task-row.is-done:hover .btt-open-hint { opacity: 1; }
            `}</style>

            <Box ref={containerRef} sx={{ position: 'fixed', bottom: 70, right: 30, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5 }}>

                {/* ── Expanded panel ── */}
                {expanded && (
                    <Box
                        className="btt-panel"
                        sx={{
                            width: 320,
                            backgroundColor: '#fff',
                            border: '1px solid #dde3ee',
                            borderRadius: 3,
                            boxShadow: '0 16px 48px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eaeff7', backgroundColor: '#f7f9fc' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PiSparkleFill style={{ color: THEME_COLORS.primary, fontSize: 15 }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
                                    AI Classification
                                </Typography>
                                {runningCount > 0 && (
                                    <Box sx={{ fontSize: 11, fontWeight: 600, color: '#fff', backgroundColor: THEME_COLORS.primary, borderRadius: 10, px: 0.9, py: 0.15, lineHeight: 1.8 }}>
                                        {runningCount} running
                                    </Box>
                                )}
                            </Box>
                            <Tooltip title="Dismiss all" arrow>
                                <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); onCloseAll?.(); setExpanded(false); }}
                                    sx={{ p: 0.5, gap: 0.4, borderRadius: 1.5, color: '#aaa', fontSize: 12, fontWeight: 500, '&:hover': { color: '#555', backgroundColor: '#eef2f9' } }}
                                >
                                    <MdClose style={{ fontSize: 13 }} />
                                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'inherit' }}>Dismiss all</Typography>
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Shimmer progress */}
                        {runningCount > 0 && (
                            <Box className="btt-shimmer-bar" sx={{ height: '2px', backgroundColor: THEME_COLORS.primary, overflow: 'hidden' }} />
                        )}

                        {/* Task list */}
                        <Box sx={{ py: 0.5 }}>
                            {tasks.map((task, i) => {
                                const isDone    = task.status === 'done';
                                const isError   = task.status === 'error';
                                const isRunning = task.status === 'running';
                                return (
                                    <Box
                                        key={task.id}
                                        className={`btt-task-row${isDone ? ' is-done' : ''}`}
                                        onClick={isDone ? () => onOpenTask?.(task) : undefined}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.25,
                                            px: 1.75, py: 1.1,
                                            borderBottom: i < tasks.length - 1 ? '1px solid #f0f3f9' : 'none',
                                        }}
                                    >
                                        {/* Status icon */}
                                        <Box sx={{ flexShrink: 0, width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isRunning && <Box className="btt-status-dot" sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: THEME_COLORS.primary }} />}
                                            {isDone    && <MdDoneAll style={{ color: '#4caf50', fontSize: 16 }} />}
                                            {isError   && <MdErrorOutline style={{ color: '#e53935', fontSize: 16 }} />}
                                        </Box>

                                        {/* File name + subtitle */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: isDone ? 500 : 400, color: isDone ? THEME_COLORS.primary : '#222', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {task.fileName}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, mt: 0.15, color: isError ? '#e53935' : isDone ? '#5a8fd4' : '#aaa', fontWeight: isDone ? 500 : 400 }}>
                                                {isDone ? 'Ready to review' : task.message}
                                            </Typography>
                                        </Box>

                                        {isDone && <span className="btt-open-hint">Open →</span>}

                                        {!isRunning && (
                                            <Tooltip title="Dismiss" arrow>
                                                <IconButton
                                                    size="small"
                                                    className="btt-dismiss-btn"
                                                    onClick={(e) => { e.stopPropagation(); onDismissTask?.(task.id); }}
                                                    sx={{ p: 0.4, color: '#ccc', '&:hover': { color: '#777', backgroundColor: '#eef2f9' }, flexShrink: 0 }}
                                                >
                                                    <MdClose style={{ fontSize: 13 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Footer summary pills */}
                        {(doneCount > 0 || errorCount > 0) && (
                            <Box sx={{ px: 1.75, pb: 1.5, pt: 1, borderTop: '1px solid #f0f3f9', backgroundColor: '#f7f9fc', display: 'flex', gap: 0.75 }}>
                                {doneCount > 0 && (
                                    <Box sx={{ fontSize: 11.5, fontWeight: 500, color: '#4caf50', backgroundColor: '#e8f5e9', borderRadius: 10, px: 1, py: 0.25 }}>
                                        ✓ {doneCount} ready
                                    </Box>
                                )}
                                {errorCount > 0 && (
                                    <Box sx={{ fontSize: 11.5, fontWeight: 500, color: '#e53935', backgroundColor: '#ffebee', borderRadius: 10, px: 1, py: 0.25 }}>
                                        ✕ {errorCount} failed
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                )}

                {/* ── Circle bubble ── */}
                <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {runningCount > 0 && (
                        <Box className="btt-pulse-ring"  sx={{ position: 'absolute', width: 52, height: 52, borderRadius: '50%', border: `1.5px solid ${THEME_COLORS.primary}`, pointerEvents: 'none' }} />
                    )}
                    {runningCount > 0 && (
                        <Box className="btt-pulse-ring2" sx={{ position: 'absolute', width: 52, height: 52, borderRadius: '50%', border: `1px solid ${THEME_COLORS.primary}`, pointerEvents: 'none' }} />
                    )}
                    <Tooltip title={expanded ? 'Hide' : 'AI tasks'} arrow placement="left">
                        <Box
                            className={runningCount > 0 ? 'btt-bubble-active' : 'btt-bubble'}
                            onClick={() => setExpanded(v => !v)}
                            sx={{
                                position: 'relative', width: 52, height: 52, borderRadius: '50%',
                                background: `linear-gradient(145deg, ${THEME_COLORS.primary}, #1e5499)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'opacity 0.15s ease',
                                '&:hover': { opacity: 0.88 },
                                '&:active': { transform: 'scale(0.93)' },
                            }}
                        >
                            <PiSparkleFill
                                className={runningCount > 0 ? 'btt-sparkle-icon' : ''}
                                style={{ color: '#fff', fontSize: 21, pointerEvents: 'none' }}
                            />
                            <Box sx={{
                                position: 'absolute', top: 1, right: 1,
                                width: 13, height: 13, borderRadius: '50%',
                                backgroundColor: badgeColor,
                                border: '2.5px solid #fff',
                                transition: 'background-color 0.3s ease',
                                ...(runningCount > 0 ? { animation: 'btt-blink 1.6s ease-in-out infinite' } : {}),
                            }} />
                        </Box>
                    </Tooltip>
                </Box>
            </Box>
        </>
    );
};

export default BackgroundTaskTracker;