package com.example.taskask.repository;

import com.example.taskask.entity.TeamMember;
import com.example.taskask.entity.TeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, TeamMemberId> {
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
    Optional<TeamMember> findByUserId(Long userId);
    List<TeamMember> findByTeamId(Long teamId);
}
