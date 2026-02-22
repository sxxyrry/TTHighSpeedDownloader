package main

import (
	"encoding/binary"
	"encoding/hex"
	"hash"
)

// md4 MD4哈希算法完整实现
type md4 struct {
	s   [4]uint32      // 状态寄存器
	x   [64]byte       // 缓冲区
	nx  int            // 缓冲区中待处理的字节数
	len uint64         // 已处理的字节数
}

// newMD4 创建新的MD4哈希器
func newMD4() hash.Hash {
	d := new(md4)
	d.Reset()
	return d
}

func (d *md4) Reset() {
	d.s = [4]uint32{
		0x67452301,
		0xefcdab89,
		0x98badcfe,
		0x10325476,
	}
	d.nx = 0
	d.len = 0
}

func (d *md4) Size() int { return 16 }
func (d *md4) BlockSize() int { return 64 }

func (d *md4) Write(p []byte) (nn int, err error) {
	nn = len(p)
	d.len += uint64(nn)
	
	// 如果缓冲区有数据，先填满缓冲区
	if d.nx > 0 {
		n := len(p)
		if n > 64-d.nx {
			n = 64 - d.nx
		}
		copy(d.x[d.nx:], p[:n])
		d.nx += n
		if d.nx == 64 {
			d.block(d.x[:])
			d.nx = 0
		}
		p = p[n:]
	}
	
	// 处理完整的64字节块
	if len(p) >= 64 {
		n := len(p) &^ (64 - 1)
		d.block(p[:n])
		p = p[n:]
	}
	
	// 保存剩余数据
	if len(p) > 0 {
		d.nx = copy(d.x[:], p)
	}
	
	return
}

func (d *md4) Sum(in []byte) []byte {
	// 保存当前状态
	d0 := d.s[0]
	d1 := d.s[1]
	d2 := d.s[2]
	d3 := d.s[3]
	
	// 计算填充
	tmp := [64]byte{}
	copy(tmp[:], d.x[:d.nx])
	tmp[d.nx] = 0x80
	
	if d.nx < 56 {
		for i := d.nx + 1; i < 56; i++ {
			tmp[i] = 0
		}
	} else {
		for i := d.nx + 1; i < 64; i++ {
			tmp[i] = 0
		}
		d.block(tmp[:])
		for i := 0; i < 56; i++ {
			tmp[i] = 0
		}
	}
	
	// 添加长度（比特数，小端序）
	length := d.len << 3
	for i := uint(0); i < 8; i++ {
		tmp[56+i] = byte(length >> (8 * i))
	}
	d.block(tmp[:])
	
	// 恢复状态
	d.s[0] = d0
	d.s[1] = d1
	d.s[2] = d2
	d.s[3] = d3
	
	// 输出结果（小端序）
	var digest [16]byte
	for i, s := range d.s {
		digest[i*4] = byte(s)
		digest[i*4+1] = byte(s >> 8)
		digest[i*4+2] = byte(s >> 16)
		digest[i*4+3] = byte(s >> 24)
	}
	return append(in, digest[:]...)
}

// block 处理一个64字节的数据块
func (d *md4) block(p []byte) {
	// 确保输入是64字节
	if len(p) != 64 {
		return
	}
	
	// 将输入分成16个32位字（小端序）
	var x [16]uint32
	for i := 0; i < 16; i++ {
		x[i] = binary.LittleEndian.Uint32(p[4*i:])
	}
	
	// 保存原始状态
	a := d.s[0]
	b := d.s[1]
	c := d.s[2]
	dreg := d.s[3] // 使用dreg避免与接收者d冲突
	
	// 循环左移函数
	rol := func(x uint32, n uint) uint32 {
		return (x << n) | (x >> (32 - n))
	}
	
	// 辅助函数
	f := func(x, y, z uint32) uint32 {
		return (x & y) | (^x & z)
	}
	
	g := func(x, y, z uint32) uint32 {
		return (x & y) | (x & z) | (y & z)
	}
	
	h := func(x, y, z uint32) uint32 {
		return x ^ y ^ z
	}
	
	// 第1轮（使用F函数）
	// 每次操作：a = rol(a + F(b,c,d) + x[k] + 0x00000000, s)
	a = rol(a + f(b, c, dreg) + x[0], 3)
	dreg = rol(dreg + f(a, b, c) + x[1], 7)
	c = rol(c + f(dreg, a, b) + x[2], 11)
	b = rol(b + f(c, dreg, a) + x[3], 19)
	
	a = rol(a + f(b, c, dreg) + x[4], 3)
	dreg = rol(dreg + f(a, b, c) + x[5], 7)
	c = rol(c + f(dreg, a, b) + x[6], 11)
	b = rol(b + f(c, dreg, a) + x[7], 19)
	
	a = rol(a + f(b, c, dreg) + x[8], 3)
	dreg = rol(dreg + f(a, b, c) + x[9], 7)
	c = rol(c + f(dreg, a, b) + x[10], 11)
	b = rol(b + f(c, dreg, a) + x[11], 19)
	
	a = rol(a + f(b, c, dreg) + x[12], 3)
	dreg = rol(dreg + f(a, b, c) + x[13], 7)
	c = rol(c + f(dreg, a, b) + x[14], 11)
	b = rol(b + f(c, dreg, a) + x[15], 19)
	
	// 第2轮（使用G函数）
	// 每次操作：a = rol(a + G(b,c,d) + x[k] + 0x5A827999, s)
	a = rol(a + g(b, c, dreg) + x[0] + 0x5A827999, 3)
	dreg = rol(dreg + g(a, b, c) + x[4] + 0x5A827999, 5)
	c = rol(c + g(dreg, a, b) + x[8] + 0x5A827999, 9)
	b = rol(b + g(c, dreg, a) + x[12] + 0x5A827999, 13)
	
	a = rol(a + g(b, c, dreg) + x[1] + 0x5A827999, 3)
	dreg = rol(dreg + g(a, b, c) + x[5] + 0x5A827999, 5)
	c = rol(c + g(dreg, a, b) + x[9] + 0x5A827999, 9)
	b = rol(b + g(c, dreg, a) + x[13] + 0x5A827999, 13)
	
	a = rol(a + g(b, c, dreg) + x[2] + 0x5A827999, 3)
	dreg = rol(dreg + g(a, b, c) + x[6] + 0x5A827999, 5)
	c = rol(c + g(dreg, a, b) + x[10] + 0x5A827999, 9)
	b = rol(b + g(c, dreg, a) + x[14] + 0x5A827999, 13)
	
	a = rol(a + g(b, c, dreg) + x[3] + 0x5A827999, 3)
	dreg = rol(dreg + g(a, b, c) + x[7] + 0x5A827999, 5)
	c = rol(c + g(dreg, a, b) + x[11] + 0x5A827999, 9)
	b = rol(b + g(c, dreg, a) + x[15] + 0x5A827999, 13)
	
	// 第3轮（使用H函数）
	// 每次操作：a = rol(a + H(b,c,d) + x[k] + 0x6ED9EBA1, s)
	a = rol(a + h(b, c, dreg) + x[0] + 0x6ED9EBA1, 3)
	dreg = rol(dreg + h(a, b, c) + x[8] + 0x6ED9EBA1, 9)
	c = rol(c + h(dreg, a, b) + x[4] + 0x6ED9EBA1, 11)
	b = rol(b + h(c, dreg, a) + x[12] + 0x6ED9EBA1, 15)
	
	a = rol(a + h(b, c, dreg) + x[2] + 0x6ED9EBA1, 3)
	dreg = rol(dreg + h(a, b, c) + x[10] + 0x6ED9EBA1, 9)
	c = rol(c + h(dreg, a, b) + x[6] + 0x6ED9EBA1, 11)
	b = rol(b + h(c, dreg, a) + x[14] + 0x6ED9EBA1, 15)
	
	a = rol(a + h(b, c, dreg) + x[1] + 0x6ED9EBA1, 3)
	dreg = rol(dreg + h(a, b, c) + x[9] + 0x6ED9EBA1, 9)
	c = rol(c + h(dreg, a, b) + x[5] + 0x6ED9EBA1, 11)
	b = rol(b + h(c, dreg, a) + x[13] + 0x6ED9EBA1, 15)
	
	a = rol(a + h(b, c, dreg) + x[3] + 0x6ED9EBA1, 3)
	dreg = rol(dreg + h(a, b, c) + x[11] + 0x6ED9EBA1, 9)
	c = rol(c + h(dreg, a, b) + x[7] + 0x6ED9EBA1, 11)
	b = rol(b + h(c, dreg, a) + x[15] + 0x6ED9EBA1, 15)
	
	// 更新状态寄存器
	d.s[0] += a
	d.s[1] += b
	d.s[2] += c
	d.s[3] += dreg
}

// MD4Hash 计算数据的MD4哈希值
func MD4Hash(data []byte) []byte {
	h := newMD4()
	h.Write(data)
	return h.Sum(nil)
}

// MD4HashString 计算数据的MD4哈希值并返回十六进制字符串
func MD4HashString(data []byte) string {
	hash := MD4Hash(data)
	return hex.EncodeToString(hash)
}