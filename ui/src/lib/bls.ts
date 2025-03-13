// eslint-disable @typescript-eslint/no-unused-vars

import {
    dataSlice,
    hexlify,
    getBytes,
    keccak256,
    randomBytes,
    solidityPacked,
    BytesLike,
    isHexString, AbiCoder
} from "ethers"
import * as mcl from "mcl-wasm"
import type {G1, G2, Fr, Fp, Fp2} from "mcl-wasm"
import {utf8ToBytes} from "@noble/curves/abstract/utils"

/**
 * Mcl wrapper for BLS operations
 * Adapted from: https://github.com/kilic/evmbls
 */
class BlsBn254 {
    static readonly FIELD_ORDER =
        0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47n

    public readonly G1: G1
    public readonly G2: G2

    private constructor() {
        this.G1 = new mcl.G1()
        const g1x: Fp = new mcl.Fp()
        const g1y: Fp = new mcl.Fp()
        const g1z: Fp = new mcl.Fp()
        g1x.setStr("01", 16)
        g1y.setStr("02", 16)
        g1z.setInt(1)
        this.G1.setX(g1x)
        this.G1.setY(g1y)
        this.G1.setZ(g1z)
        this.G2 = new mcl.G2()
        const g2x = createFp2(
            "0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed",
            "0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2",
        )
        const g2y = createFp2(
            "0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa",
            "0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b",
        )
        const g2z = createFp2("0x01", "0x00")
        this.G2.setX(g2x)
        this.G2.setY(g2y)
        this.G2.setZ(g2z)
    }

    public static async create() {
        await mcl.init(mcl.BN_SNARK1)
        mcl.setETHserialization(true)
        mcl.setMapToMode(0) // FT
        return new BlsBn254()
    }

    public newG1(): G1 {
        return new mcl.G1()
    }

    public newG2(): G2 {
        return new mcl.G2()
    }

    public newFp(): Fp {
        return new mcl.Fp()
    }

    public expandMsg(domain: Uint8Array, msg: Uint8Array, outLen: number): Uint8Array {
        if (domain.length > 255) {
            throw new Error("bad domain size")
        }

        const domainLen = domain.length
        if (domainLen > 255) {
            throw new Error("InvalidDSTLength")
        }
        const zpad = new Uint8Array(136)
        const b_0 = solidityPacked(
            ["bytes", "bytes", "uint8", "uint8", "uint8", "bytes", "uint8"],
            [zpad, msg, outLen >> 8, outLen & 0xff, 0, domain, domainLen],
        )
        const b0 = keccak256(b_0)

        const b_i = solidityPacked(
            ["bytes", "uint8", "bytes", "uint8"],
            [b0, 1, domain, domain.length],
        )
        let bi = keccak256(b_i)

        const out = new Uint8Array(outLen)
        const ell = Math.floor((outLen + 32 - 1) / 32) // keccak256 blksize
        for (let i = 1; i < ell; i++) {
            const b_i = solidityPacked(
                ["bytes32", "uint8", "bytes", "uint8"],
                [toHex(BigInt(b0) ^ BigInt(bi)), 1 + i, domain, domain.length],
            )
            const bi_bytes = getBytes(bi)
            for (let j = 0; j < 32; j++) {
                out[(i - 1) * 32 + j] = bi_bytes[j]
            }
            bi = keccak256(b_i)
        }
        const bi_bytes = getBytes(bi)
        for (let j = 0; j < 32; j++) {
            out[(ell - 1) * 32 + j] = bi_bytes[j]
        }
        return out
    }

    public hashToField(domain: Uint8Array, msg: Uint8Array, count: number): bigint[] {
        const u = 48
        const _msg = this.expandMsg(domain, msg, count * u)
        const els: bigint[] = []
        for (let i = 0; i < count; i++) {
            const el = mod(BigInt(hexlify(_msg.slice(i * u, (i + 1) * u))), BlsBn254.FIELD_ORDER)
            els.push(el)
        }
        return els
    }

    public hashToPoint(domain: Uint8Array, msg: Uint8Array): G1 {
        const hashRes = this.hashToField(domain, msg, 2)
        const e0 = hashRes[0]
        const e1 = hashRes[1]
        const p0 = this.mapToPoint(toHex(e0))
        const p1 = this.mapToPoint(toHex(e1))
        const p = mcl.add(p0, p1)
        p.normalize()

        return p
    }

    public serialiseFp(p: Fp | Fp2): `0x${string}` {
        // NB: big-endian
        return ("0x" +
            Array.from(p.serialize())
                .reverse()
                .map((value) => value.toString(16).padStart(2, "0"))
                .join("")) as `0x${string}`
    }

    public serialiseG1Point(p: G1): [bigint, bigint] {
        p.normalize()
        const x = BigInt(this.serialiseFp(p.getX()))
        const y = BigInt(this.serialiseFp(p.getY()))
        return [x, y]
    }

    public serialiseG1Hex(g1: G1): string {
        const p = this.serialiseG1Point(g1)
        return AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [p[0], p[1]])
    }

    public serialiseG2Point(p: G2): [bigint, bigint, bigint, bigint] {
        const x = this.serialiseFp(p.getX())
        const y = this.serialiseFp(p.getY())
        return [
            BigInt(dataSlice(x, 32)),
            BigInt(dataSlice(x, 0, 32)),
            BigInt(dataSlice(y, 32)),
            BigInt(dataSlice(y, 0, 32)),
        ]
    }

    public deserialiseFp2([x, y]: [bigint, bigint]): Fp2 {
        const xx = new mcl.Fp()
        const yy = new mcl.Fp()
        xx.setStr(toHex(x), 16)
        yy.setStr(toHex(y), 16)

        const out = new mcl.Fp2()
        out.set_a(xx)
        out.set_b(yy)

        return out
    }

    public g1FromEvmHex(input: BytesLike) {
        const hex = hexlify(input)
        const trimmed = hex.startsWith("0x") ? hex.slice(2) : hex
        const x = trimmed.slice(0, trimmed.length / 2)
        const y = trimmed.slice(trimmed.length / 2, trimmed.length)

        return this.g1FromEvm(BigInt(`0x${x}`), BigInt(`0x${y}`))
    }

    public g2FromEvmHex(input: BytesLike): G2 {
        const hex = hexlify(input)
        const trimmed = hex.startsWith("0x") ? hex.slice(2) : hex
        const x = trimmed.slice(0, trimmed.length / 2)
        const y = trimmed.slice(trimmed.length / 2, trimmed.length)

        const x1 = x.slice(0, x.length / 2)
        const x2 = x.slice(x.length / 2, x.length)

        const y1 = y.slice(0, x.length / 2)
        const y2 = y.slice(x.length / 2, x.length)

        return this.g2FromEvm([
            BigInt(`0x${x1}`),
            BigInt(`0x${x2}`),
            BigInt(`0x${y1}`),
            BigInt(`0x${y2}`)
        ])
    }

    public g1FromEvm(g1X: bigint, g1Y: bigint) {
        const x = toHex(g1X)
        const y = toHex(g1Y)

        const Mx = this.newFp()
        const My = this.newFp()
        const Mz = this.newFp()
        Mx.setStr(x, 16)
        My.setStr(y, 16)
        Mz.setInt(1)

        const M = this.newG1()
        M.setX(Mx)
        M.setY(My)
        M.setZ(Mz)
        return M
    }

    public g2FromEvm([x1, x2, y1, y2]: [bigint, bigint, bigint, bigint]) {
        const out = this.newG2()
        out.setX(this.deserialiseFp2([x1, x2]))
        out.setY(this.deserialiseFp2([y1, y2]))
        // this is swapped because EVM (:
        out.setZ(this.deserialiseFp2([1n, 0n]))
        return out
    }

    public g2From(input: BytesLike): G2 {
        const out = this.G2.clone()
        out.deserialize(bytes(input))
        return out
    }

    public createKeyPair(_secretKey?: `0x${string}`) {
        if (!_secretKey) {
            _secretKey = hexlify(randomBytes(31)) as `0x${string}`
        }

        const secretKey: Fr = new mcl.Fr()
        secretKey.setHashOf(_secretKey)
        const pubKey: G2 = mcl.mul(this.G2, secretKey)
        pubKey.normalize()
        return {
            secretKey,
            _secretKey,
            pubKey,
        }
    }

    public createKeyPairG1PublicKey(_secretKey?: `0x${string}`) {
        if (!_secretKey) {
            _secretKey = hexlify(randomBytes(31)) as `0x${string}`
        }

        const secretKey: Fr = new mcl.Fr()
        secretKey.setHashOf(_secretKey)
        const pubKey: G1 = mcl.mul(this.G1, secretKey)
        pubKey.normalize()
        return {
            secretKey,
            _secretKey,
            pubKey,
        }
    }

    public sign(M: G1, secret: Fr) {
        const signature: G1 = mcl.mul(M, secret)
        signature.normalize()
        return {
            signature,
            M,
        }
    }

    public verify(h_m: G1, pk: G2, signature: G1): boolean {
        return mcl.pairing(h_m, pk).isEqual(mcl.pairing(signature, this.G2))
    }

    public toArgs(pubKey: G2, M: G1, signature: G1) {
        return {
            signature: this.serialiseG1Point(signature),
            pubKey: this.serialiseG2Point(pubKey),
            M: this.serialiseG1Point(M),
        }
    }

    public mapToPoint(eHex: `0x${string}`): G1 {
        const C2 = 0x183227397098d014dc2822db40c0ac2ecbc0b548b438e5469e10460b6c3e7ea3n
        const C3 = 0x16789af3a83522eb353c98fc6b36d713d5d8d1cc5dffffffan
        const C4 = 0x10216f7ba065e00de81ac1e7808072c9dd2b2385cd7b438469602eb24829a9bdn
        const Z = 1n
        const g = this.g.bind(this)
        const neg = this.neg.bind(this)
        const add = this.add.bind(this)
        const sub = this.sub.bind(this)
        const mul = this.mul.bind(this)
        const inv0 = this.inv0.bind(this)
        const sgn0 = this.sgn0.bind(this)
        const legendre = this.legendre.bind(this)
        const sqrt = this.sqrt.bind(this)

        const u = BigInt(eHex)

        let tv1 = mul(mul(u, u), g(Z))
        const tv2 = add(1n, tv1)
        tv1 = sub(1n, tv1)
        const tv3 = inv0(mul(tv1, tv2))
        const tv5 = mul(mul(mul(u, tv1), tv3), C3)
        const x1 = add(C2, neg(tv5))
        const x2 = add(C2, tv5)
        const tv7 = mul(tv2, tv2)
        const tv8 = mul(tv7, tv3)
        const x3 = add(Z, mul(C4, mul(tv8, tv8)))

        let x
        let y
        if (legendre(g(x1)) === 1n) {
            x = x1
            y = sqrt(g(x1))
        } else if (legendre(g(x2)) === 1n) {
            x = x2
            y = sqrt(g(x2))
        } else {
            x = x3
            y = sqrt(g(x3))
        }
        if (sgn0(u) != sgn0(y)) {
            y = neg(y)
        }

        const g1x: Fp = new mcl.Fp()
        const g1y: Fp = new mcl.Fp()
        const g1z: Fp = new mcl.Fp()
        g1x.setStr(x.toString(), 10)
        g1y.setStr(y.toString(), 10)
        g1z.setInt(1)
        const point: G1 = new mcl.G1()
        point.setX(g1x)
        point.setY(g1y)
        point.setZ(g1z)
        return point
    }

    private g(x: bigint): bigint {
        const mul = this.mul.bind(this)
        const add = this.add.bind(this)
        return add(mul(mul(x, x), x), 3n)
    }

    private neg(x: bigint) {
        return mod(-x, BlsBn254.FIELD_ORDER)
    }

    private mul(a: bigint, b: bigint) {
        return mod(a * b, BlsBn254.FIELD_ORDER)
    }

    private add(a: bigint, b: bigint) {
        return mod(a + b, BlsBn254.FIELD_ORDER)
    }

    private sub(a: bigint, b: bigint) {
        return mod(a - b, BlsBn254.FIELD_ORDER)
    }

    private exp(x: bigint, n: bigint): bigint {
        const mul = this.mul.bind(this)
        let result = 1n
        let base = mod(x, BlsBn254.FIELD_ORDER)
        let e_prime = n
        while (e_prime > 0) {
            if (mod(e_prime, 2n) == 1n) {
                result = mul(result, base)
            }
            e_prime = e_prime >> 1n
            base = mul(base, base)
        }
        return result
    }

    private sqrt(u: bigint) {
        return this.exp(u, 0xc19139cb84c680a6e14116da060561765e05aa45a1c72a34f082305b61f3f52n)
    }

    private sgn0(x: bigint) {
        return mod(x, 2n)
    }

    private inv0(x: bigint) {
        if (x === 0n) {
            return 0n
        }
        return this.exp(x, BlsBn254.FIELD_ORDER - 2n)
    }

    private legendre(u: bigint): 1n | 0n | -1n {
        const x = this.exp(u, 0x183227397098d014dc2822db40c0ac2ecbc0b548b438e5469e10460b6c3e7ea3n)
        if (x === BlsBn254.FIELD_ORDER - 1n) {
            return -1n
        }
        if (x !== 0n && x !== 1n) {
            throw Error("Legendre symbol calc failed")
        }
        return x
    }

    public aggregate(acc: G1 | G2, other: G1 | G2) {
        const _acc = mcl.add(acc, other);
        _acc.normalize();
        return _acc;
    }

}

function bytes(b: BytesLike): Uint8Array {
    if (typeof b === "string" && !isHexString(b)) {
        return utf8ToBytes(b)
    }
    return getBytes(b)
}


export function byteSwap(hex: string, n: number) {
    const bytes = getBytes("0x" + hex)
    if (bytes.byteLength !== n) throw new Error(`Invalid length: ${bytes.byteLength}`)
    return Array.from(bytes)
        .reverse()
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
}

// mcl format:      x = a + bi
// kyber format:    x = b + ai
export function kyberMarshalG2(p: G2) {
    return [
        byteSwap(p.getX().get_b().serializeToHexStr(), 32),
        byteSwap(p.getX().get_a().serializeToHexStr(), 32),
        byteSwap(p.getY().get_b().serializeToHexStr(), 32),
        byteSwap(p.getY().get_a().serializeToHexStr(), 32),
    ].join("")
}

export function kyberMarshalG1(p: G1) {
    return [
        byteSwap(p.getX().serializeToHexStr(), 32),
        byteSwap(p.getY().serializeToHexStr(), 32),
    ].join("")
}

function mod(a: bigint, b: bigint) {
    return ((a % b) + b) % b
}

export function toHex(n: bigint): `0x${string}` {
    return ("0x" + n.toString(16).padStart(64, "0")) as `0x${string}`
}

function createFp2(a: string, b: string) {
    const fp2_a: Fp = new mcl.Fp()
    const fp2_b: Fp = new mcl.Fp()
    fp2_a.setStr(a)
    fp2_b.setStr(b)
    const fp2: Fp2 = new mcl.Fp2()
    fp2.set_a(fp2_a)
    fp2.set_b(fp2_b)
    return fp2
}

function bytesEqual(bytes1: BytesLike, bytes2: BytesLike): boolean {
    const arr1 = getBytes(bytes1)
    const arr2 = getBytes(bytes2)
    if (arr1.length !== arr2.length) {
        return false
    }

    return arr1.every((value, index) => value === arr2[index])
}

export function serialiseG2Point(p: G2): [bigint, bigint, bigint, bigint] {
    const x = serialiseFp(p.getX())
    const y = serialiseFp(p.getY())
    return [
        BigInt(dataSlice(x, 32)),
        BigInt(dataSlice(x, 0, 32)),
        BigInt(dataSlice(y, 32)),
        BigInt(dataSlice(y, 0, 32)),
    ]
}

export function serialiseFp(p: Fp | Fp2): `0x${string}` {
    // NB: big-endian
    return ("0x" +
        Array.from(p.serialize())
            .reverse()
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("")) as `0x${string}`
}

export {BlsBn254, bytesEqual}