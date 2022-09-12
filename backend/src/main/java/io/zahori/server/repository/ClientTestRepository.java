package io.zahori.server.repository;

import java.util.Set;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import io.zahori.server.model.ClientTestRepo;

/**
 * The interface Configuration repository.
 */
//@Repository
@RepositoryRestResource(path = "client_test_repo")
public interface ClientTestRepository extends CrudRepository<ClientTestRepo, Long> {
    /**
     * Find by client id set.
     *
     * @param clientId the process id
     * @return the set
     */
    @Query("SELECT c FROM ClientTestRepo c WHERE c.id.clientId = :clientId")
    Set<ClientTestRepo> findByClientId(@Param("clientId") Long clientId);

    @Query("SELECT c FROM ClientTestRepo c WHERE c.id.clientId = :clientId and c.id.testRepoId = :testRepoId")
    ClientTestRepo findByClientIdAndTestRepoId(@Param("clientId") Long clientId, @Param("testRepoId") Long testRepoId);
}
