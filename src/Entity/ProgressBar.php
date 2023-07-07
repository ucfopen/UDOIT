<?
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ProgressBarRepository")
 */
class ProgressBar
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $title;

    /**
     * @ORM\Column(type="integer")
     */
    private $progress;

    /**
     * @ORM\Column(type="integer")
     */
    private $total;


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProgress(): ?int
    {
        return $this->progress;
    }

    public function getTotal(): ?int 
    {
        return $this->total;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setProgress(int $progress): self
    {
        $this->progress = $progress;
        return $this;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function setTotal(int $total): self
    {
        $this->total = $total;
        return $this;
    }
}
