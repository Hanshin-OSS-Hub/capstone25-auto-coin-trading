package com.capston.arbitrage.repository;

import com.capston.arbitrage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // username으로 사용자 찾기
    Optional<User> findByUsername(String username);

    // email로 사용자 찾기
    Optional<User> findByEmail(String email);

    // username 중복 체크
    boolean existsByUsername(String username);

    // email 중복 체크
    boolean existsByEmail(String email);
}