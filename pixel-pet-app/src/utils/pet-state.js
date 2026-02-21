// 宠物状态管理
const MAX = 100;
const DECAY_MS = 60 * 1000;

export const PetState = {
  create() {
    return { hunger: 80, happiness: 80, affection: 50, health: 100, lastUpdate: Date.now() };
  },

  decay(state) {
    const elapsed = Date.now() - state.lastUpdate;
    const ticks = Math.floor(elapsed / DECAY_MS);
    if (ticks <= 0) return state;

    const hunger = Math.max(0, state.hunger - ticks * 2);
    const happiness = Math.max(0, state.happiness - ticks);
    // 饥饿会影响健康
    const healthLoss = hunger === 0 ? ticks : 0;
    const health = Math.max(0, state.health - healthLoss);

    return { ...state, hunger, happiness, health, lastUpdate: Date.now() };
  },

  // 喂食 - 返回 { state, result: 'ok'|'full'|'refuse'|'sick', msg }
  feed(state) {
    const s = this.decay(state);
    if (s.health < 20) return { state: s, result: 'sick', msg: '生病了...' };
    if (s.affection < 20) return { state: s, result: 'refuse', msg: '不想吃你的东西！' };
    if (s.hunger >= 95) return { state: s, result: 'full', msg: '吃不下了~' };

    const add = s.hunger > 80 ? 10 : 25;
    return {
      state: { ...s, hunger: Math.min(MAX, s.hunger + add), happiness: Math.min(MAX, s.happiness + 5), affection: Math.min(MAX, s.affection + 2) },
      result: 'ok', msg: `饱食+${add}`
    };
  },

  // 玩耍
  play(state) {
    const s = this.decay(state);
    if (s.health < 20) return { state: s, result: 'sick', msg: '没力气玩...' };
    if (s.hunger < 20) return { state: s, result: 'hungry', msg: '太饿了，先吃东西...' };
    if (s.affection < 15) return { state: s, result: 'refuse', msg: '不想跟你玩！' };

    return {
      state: { ...s, hunger: Math.max(0, s.hunger - 8), happiness: Math.min(MAX, s.happiness + 20), affection: Math.min(MAX, s.affection + 5) },
      result: 'ok', msg: '心情+20'
    };
  },

  // 抚摸
  pet(state) {
    const s = this.decay(state);
    if (s.health < 10) return { state: s, result: 'sick', msg: '...' };
    // 好感度低时抚摸可能被拒绝
    if (s.affection < 10 && Math.random() < 0.5) return { state: s, result: 'refuse', msg: '别碰我！' };

    const affAdd = s.affection < 30 ? 5 : 3;
    return {
      state: { ...s, happiness: Math.min(MAX, s.happiness + 10), affection: Math.min(MAX, s.affection + affAdd) },
      result: 'ok', msg: `好感+${affAdd}`
    };
  },

  // 治疗（当健康值低时）
  heal(state) {
    const s = this.decay(state);
    if (s.health >= 80) return { state: s, result: 'healthy', msg: '很健康哦~' };
    return {
      state: { ...s, health: Math.min(MAX, s.health + 30), happiness: Math.min(MAX, s.happiness + 10) },
      result: 'ok', msg: '健康+30'
    };
  },

  getMood(state) {
    const s = this.decay(state);
    if (s.health < 20) return 'sick';
    if (s.hunger < 15) return 'hungry';
    const avg = (s.hunger + s.happiness) / 2;
    if (avg >= 70) return 'happy';
    if (avg >= 40) return 'idle';
    if (avg >= 20) return 'sad';
    return 'sleep';
  },

  isDead(state) {
    return this.decay(state).health <= 0;
  }
};
