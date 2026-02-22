package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

// PerformanceMonitor 性能监控器
type PerformanceMonitor struct {
	startTime       time.Time
	totalBytes      int64
	lastBytes       int64
	lastUpdateTime  time.Time
	currentSpeed    float64 // bytes per second
	averageSpeed    float64 // bytes per second
	peakSpeed       float64 // bytes per second
	chunkDownloads  int64
	failedChunks    int64
	retriedChunks   int64
	mutex           sync.RWMutex
}

// NewPerformanceMonitor 创建新的性能监控器
func NewPerformanceMonitor() *PerformanceMonitor {
	return &PerformanceMonitor{
		startTime:      time.Now(),
		lastUpdateTime: time.Now(),
	}
}

// AddBytes 添加已下载的字节数
func (pm *PerformanceMonitor) AddBytes(bytes int64) {
	atomic.AddInt64(&pm.totalBytes, bytes)
	pm.updateSpeed()
}

// AddChunkDownload 记录分块下载完成
func (pm *PerformanceMonitor) AddChunkDownload() {
	atomic.AddInt64(&pm.chunkDownloads, 1)
}

// AddFailedChunk 记录失败的分块
func (pm *PerformanceMonitor) AddFailedChunk() {
	atomic.AddInt64(&pm.failedChunks, 1)
}

// AddRetriedChunk 记录重试的分块
func (pm *PerformanceMonitor) AddRetriedChunk() {
	atomic.AddInt64(&pm.retriedChunks, 1)
}

// updateSpeed 更新下载速度
func (pm *PerformanceMonitor) updateSpeed() {
	pm.mutex.Lock()
	defer pm.mutex.Unlock()

	now := time.Now()
	duration := now.Sub(pm.lastUpdateTime).Seconds()
	
	if duration > 0.5 { // 至少0.5秒更新一次
		currentBytes := atomic.LoadInt64(&pm.totalBytes)
		bytesDiff := currentBytes - pm.lastBytes
		pm.currentSpeed = float64(bytesDiff) / duration
		
		// 更新峰值速度
		if pm.currentSpeed > pm.peakSpeed {
			pm.peakSpeed = pm.currentSpeed
		}
		
		// 更新平均速度
		totalDuration := now.Sub(pm.startTime).Seconds()
		if totalDuration > 0 {
			pm.averageSpeed = float64(currentBytes) / totalDuration
		}
		
		pm.lastBytes = currentBytes
		pm.lastUpdateTime = now
	}
}

// GetStats 获取性能统计
func (pm *PerformanceMonitor) GetStats() map[string]interface{} {
	pm.mutex.RLock()
	defer pm.mutex.RUnlock()

	return map[string]interface{}{
		"total_bytes":      atomic.LoadInt64(&pm.totalBytes),
		"current_speed_bps": pm.currentSpeed,
		"current_speed_mbps": pm.currentSpeed / (1024 * 1024),
		"average_speed_bps": pm.averageSpeed,
		"average_speed_mbps": pm.averageSpeed / (1024 * 1024),
		"peak_speed_bps":    pm.peakSpeed,
		"peak_speed_mbps":   pm.peakSpeed / (1024 * 1024),
		"chunk_downloads":   atomic.LoadInt64(&pm.chunkDownloads),
		"failed_chunks":     atomic.LoadInt64(&pm.failedChunks),
		"retried_chunks":    atomic.LoadInt64(&pm.retriedChunks),
		"elapsed_time":      time.Since(pm.startTime).Seconds(),
	}
}

// PrintStats 打印性能统计
func (pm *PerformanceMonitor) PrintStats() {
	stats := pm.GetStats()
	fmt.Println("=== 下载性能统计 ===")
	fmt.Printf("总下载量: %.2f MB\n", float64(stats["total_bytes"].(int64))/(1024*1024))
	fmt.Printf("当前速度: %.2f MB/s\n", stats["current_speed_mbps"])
	fmt.Printf("平均速度: %.2f MB/s\n", stats["average_speed_mbps"])
	fmt.Printf("峰值速度: %.2f MB/s\n", stats["peak_speed_mbps"])
	fmt.Printf("分块下载数: %d\n", stats["chunk_downloads"])
	fmt.Printf("失败分块: %d\n", stats["failed_chunks"])
	fmt.Printf("重试分块: %d\n", stats["retried_chunks"])
	fmt.Printf("运行时间: %.1f 秒\n", stats["elapsed_time"])
}

// GlobalPerformanceMonitor 全局性能监控器
var (
	globalMonitor *PerformanceMonitor
	monitorOnce   sync.Once
)

// GetGlobalMonitor 获取全局性能监控器
func GetGlobalMonitor() *PerformanceMonitor {
	monitorOnce.Do(func() {
		globalMonitor = NewPerformanceMonitor()
	})
	return globalMonitor
}